import { useState } from 'react';
import { Trade, TradeCategory } from '@/types/trade';
import { formatNumber } from '@/utils/calculations';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Filter, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EditTradeDialog } from './EditTradeDialog';

interface ItemHistoryProps {
  trades: Trade[];
  onDeleteTrade: (tradeId: string) => void;
  onUpdateTrade?: (updatedTrade: Trade) => Promise<boolean>;
}

export function ItemHistory({ trades, onDeleteTrade, onUpdateTrade }: ItemHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TradeCategory | 'all'>('all');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  
  const { toast } = useToast();

  const categories: TradeCategory[] = [
    'Armors', 'Swords', 'Bows', 'Skins', 'Dyes', 'Miscellaneous', 'Accessories'
  ];


  const calculateLowballPercent = (trade: Trade): number => {
    if (trade.costBasis === 'lowestBin' && trade.lowestBin > 0) {
      return Math.round(100 - (trade.pricePaid / trade.lowestBin) * 100);
    } else if (trade.costBasis === 'craftCost' && trade.craftCost > 0) {
      return Math.round(100 - (trade.pricePaid / trade.craftCost) * 100);
    }
    // Default to lowest bin if available
    if (trade.lowestBin > 0) {
      return Math.round(100 - (trade.pricePaid / trade.lowestBin) * 100);
    }
    return 0;
  };

  // Filter trades based on search term and category
  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || trade.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort trades by date (newest first)
  const sortedTrades = [...filteredTrades].sort((a, b) => 
    new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

  const handleDeleteTrade = (trade: Trade) => {
    onDeleteTrade(trade.id);
    toast({
      title: "Trade deleted",
      description: `${trade.itemName} trade has been removed from history`,
    });
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
  };

  const handleUpdateTrade = async (updatedTrade: Trade): Promise<boolean> => {
    if (onUpdateTrade) {
      const success = await onUpdateTrade(updatedTrade);
      if (success) {
        toast({
          title: "Trade updated",
          description: `${updatedTrade.itemName} trade has been updated successfully`,
        });
      }
      return success;
    }
    return false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item History</CardTitle>
        <p className="text-sm text-muted-foreground">
          All your lowballing trades with filtering options
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as TradeCategory | 'all')}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No trades recorded yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add your first trade to see the history here
            </p>
          </div>
        ) : sortedTrades.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No trades found {searchTerm && `matching "${searchTerm}"`} {selectedCategory !== 'all' && `in ${selectedCategory} category`}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Lowest BIN</TableHead>
                  <TableHead>Raw Craft Cost</TableHead>
                  <TableHead>Price Paid</TableHead>
                  <TableHead>Price Sold</TableHead>
                  <TableHead>Lowball %</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTrades.map((trade) => {
                  const lowballPercent = calculateLowballPercent(trade);
                  return (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">{trade.itemName}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {trade.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        {trade.lowestBin > 0 ? formatNumber(trade.lowestBin) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {trade.craftCost > 0 ? formatNumber(trade.craftCost) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {formatNumber(trade.pricePaid)}
                      </TableCell>
                      <TableCell>
                        {trade.soldPrice > 0 ? formatNumber(trade.soldPrice) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          lowballPercent > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {lowballPercent}%
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(trade.dateTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary hover:text-primary-foreground hover:bg-primary"
                            onClick={() => handleEditTrade(trade)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Trade</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the trade for "{trade.itemName}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleDeleteTrade(trade)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>

      <EditTradeDialog
        trade={editingTrade}
        open={!!editingTrade}
        onClose={() => setEditingTrade(null)}
        onSave={handleUpdateTrade}
      />
    </Card>
  );
}