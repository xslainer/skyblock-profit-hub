import { useState } from 'react';
import { Trade, TradeCategory } from '@/types/trade';
import { calculateProfit, parseShorthand } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PriceInput } from '@/components/ui/price-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Upload, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkTradeRow {
  id: string;
  itemName: string;
  category: TradeCategory | '';
  lowestBin: string;
  craftCost: string;
  pricePaid: string;
  ahAverageValue: string;
  lowballPercent: string;
  soldPrice: string;
  dateTime: string;
  costBasis: 'lowestBin' | 'craftCost' | 'pricePaid';
  lowballBasis: 'lowestBin' | 'craftCost';
}

interface BulkAddTradesProps {
  onTradesAdded: (trades: Trade[]) => void;
}

export function BulkAddTrades({ onTradesAdded }: BulkAddTradesProps) {
  const createEmptyRow = (): BulkTradeRow => ({
    id: crypto.randomUUID(),
    itemName: '',
    category: '',
    lowestBin: '',
    craftCost: '',
    pricePaid: '',
    ahAverageValue: '',
    lowballPercent: '',
    soldPrice: '',
    dateTime: new Date().toISOString().slice(0, 16),
    costBasis: 'lowestBin',
    lowballBasis: 'lowestBin'
  });

  // Initialize with 3 empty rows
  const [rows, setRows] = useState<BulkTradeRow[]>(() => [
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow()
  ]);
  const { toast } = useToast();


  const addRow = () => {
    setRows(prev => [...prev, createEmptyRow()]);
  };

  const removeRow = (id: string) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof BulkTradeRow, value: string) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const validateAndSubmit = () => {
    const validRows = rows.filter(row => 
      row.itemName && row.category && row.soldPrice && row.lowestBin
    );

    if (validRows.length === 0) {
      toast({
        title: "No valid trades",
        description: "Please fill in at least one complete trade row.",
        variant: "destructive",
      });
      return;
    }

    const trades: Trade[] = validRows.map(row => {
      const lowestBin = parseShorthand(row.lowestBin);
      const craftCost = parseShorthand(row.craftCost) || 0;
      const pricePaid = parseShorthand(row.pricePaid) || 0;
      const ahAverageValue = parseShorthand(row.ahAverageValue) || lowestBin;
      const soldPrice = parseShorthand(row.soldPrice);
      
      const costBasisValue = row.costBasis === 'lowestBin' ? lowestBin : 
                           row.costBasis === 'craftCost' ? craftCost : pricePaid;
      
      const { taxPercent, taxAmount, netProfit } = calculateProfit(soldPrice, costBasisValue);
      
      const lowballBasisValue = row.lowballBasis === 'lowestBin' ? lowestBin : craftCost;
      const lowballPercent = lowballBasisValue > 0 ? 
        ((lowballBasisValue - (pricePaid || lowestBin)) / lowballBasisValue) * 100 : 0;

      return {
        id: crypto.randomUUID(),
        itemName: row.itemName,
        category: row.category as TradeCategory,
        lowestBin,
        craftCost,
        pricePaid: pricePaid || lowestBin,
        ahAverageValue,
        lowballPercent: Math.max(0, lowballPercent),
        soldPrice,
        taxPercent,
        taxAmount,
        netProfit,
        dateTime: new Date(row.dateTime),
        costBasis: row.costBasis,
        lowballBasis: row.lowballBasis,
        status: 'completed'
      };
    });

    onTradesAdded(trades);
    setRows([]);
    
    toast({
      title: "Trades added successfully",
      description: `Added ${trades.length} trades to your history.`,
    });
  };

  const categories: TradeCategory[] = ['Armors', 'Swords', 'Bows', 'Skins', 'Dyes', 'Miscellaneous', 'Accessories'];

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header row if present
        const dataLines = lines[0].toLowerCase().includes('item') ? lines.slice(1) : lines;
        
        const newRows: BulkTradeRow[] = dataLines.map(line => {
          const [itemName, category, lowestBin, craftCost, pricePaid, ahAverageValue, soldPrice, dateTime] = 
            line.split(',').map(field => field.trim());
          
          return {
            id: crypto.randomUUID(),
            itemName: itemName || '',
            category: (category as TradeCategory) || '',
            lowestBin: lowestBin || '',
            craftCost: craftCost || '',
            pricePaid: pricePaid || '',
            ahAverageValue: ahAverageValue || '',
            lowballPercent: '',
            soldPrice: soldPrice || '',
            dateTime: dateTime || new Date().toISOString().slice(0, 16),
            costBasis: 'lowestBin',
            lowballBasis: 'lowestBin'
          };
        });
        
        setRows(prev => [...prev, ...newRows]);
        
        toast({
          title: "CSV imported",
          description: `Added ${newRows.length} rows from CSV file.`,
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Add Trades
          </CardTitle>
          <p className="text-muted-foreground">
            Quickly add multiple trades at once using a spreadsheet-like interface
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button onClick={addRow} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
              
              <label htmlFor="csv-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">
                    <FileUp className="w-4 h-4 mr-2" />
                    Import CSV
                  </span>
                </Button>
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </div>
            
            {rows.length > 0 && (
              <Button onClick={validateAndSubmit}>
                Submit All Trades ({rows.length})
              </Button>
            )}
          </div>

          {rows.length > 0 && (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Item Name</TableHead>
                    <TableHead className="min-w-[120px]">Category</TableHead>
                    <TableHead className="min-w-[100px]">Lowest BIN</TableHead>
                    <TableHead className="min-w-[100px]">Craft Cost</TableHead>
                    <TableHead className="min-w-[100px]">Price Paid</TableHead>
                    <TableHead className="min-w-[100px]">AH Average</TableHead>
                    <TableHead className="min-w-[100px]">Sold Price</TableHead>
                    <TableHead className="min-w-[140px]">Date & Time</TableHead>
                    <TableHead className="min-w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Input
                          value={row.itemName}
                          onChange={(e) => updateRow(row.id, 'itemName', e.target.value)}
                          placeholder="Item name"
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={row.category} onValueChange={(value: TradeCategory) => updateRow(row.id, 'category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <PriceInput
                          value={row.lowestBin}
                          onChange={(e) => updateRow(row.id, 'lowestBin', e.target.value)}
                          placeholder="e.g., 100m"
                        />
                      </TableCell>
                      <TableCell>
                        <PriceInput
                          value={row.craftCost}
                          onChange={(e) => updateRow(row.id, 'craftCost', e.target.value)}
                          placeholder="e.g., 90m"
                        />
                      </TableCell>
                      <TableCell>
                        <PriceInput
                          value={row.pricePaid}
                          onChange={(e) => updateRow(row.id, 'pricePaid', e.target.value)}
                          placeholder="e.g., 80m"
                        />
                      </TableCell>
                      <TableCell>
                        <PriceInput
                          value={row.ahAverageValue}
                          onChange={(e) => updateRow(row.id, 'ahAverageValue', e.target.value)}
                          placeholder="e.g., 95m"
                        />
                      </TableCell>
                      <TableCell>
                        <PriceInput
                          value={row.soldPrice}
                          onChange={(e) => updateRow(row.id, 'soldPrice', e.target.value)}
                          placeholder="e.g., 110m"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="datetime-local"
                          value={row.dateTime}
                          onChange={(e) => updateRow(row.id, 'dateTime', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeRow(row.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {rows.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No trades added yet. Click "Add Row" to start bulk entry.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}