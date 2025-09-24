import { useState, useMemo } from 'react';
import { InventoryItem } from '@/types/trade';
import { formatNumber } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Trash2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Inventory() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    // Sample data - in real app this would come from a database
    {
      id: '1',
      itemName: 'Hyperion',
      category: 'Swords',
      datePurchased: new Date('2024-01-15'),
      pricePaid: 850000000,
      currentLowestBin: 920000000,
    },
    {
      id: '2',
      itemName: 'Necron Chestplate',
      category: 'Armors',
      datePurchased: new Date('2024-01-20'),
      pricePaid: 45000000,
      currentLowestBin: 42000000,
    },
  ]);
  const { toast } = useToast();

  const inventoryKPIs = useMemo(() => {
    const totalItems = inventoryItems.length;
    const totalCost = inventoryItems.reduce((sum, item) => sum + item.pricePaid, 0);
    const currentMarketValue = inventoryItems.reduce((sum, item) => sum + item.currentLowestBin, 0);
    const unrealizedProfit = currentMarketValue - totalCost;

    return {
      totalItems,
      totalCost,
      currentMarketValue,
      unrealizedProfit,
    };
  }, [inventoryItems]);

  const calculatePotentialProfit = (item: InventoryItem) => {
    const grossProfit = item.currentLowestBin - item.pricePaid;
    const ahTax = item.currentLowestBin * 0.01; // 1% AH tax
    return grossProfit - ahTax;
  };

  const refreshPrices = async () => {
    toast({
      title: "Refreshing prices...",
      description: "Updating current market values from Hypixel API.",
    });
    
    // TODO: Implement actual API call to update prices
    setTimeout(() => {
      toast({
        title: "Prices updated",
        description: "All item prices have been refreshed.",
      });
    }, 2000);
  };

  const markAsSold = (item: InventoryItem) => {
    // TODO: Navigate to Add Trade form with pre-filled data
    toast({
      title: "Opening trade form",
      description: `Pre-filling form for ${item.itemName}`,
    });
  };

  const removeItem = (itemId: string) => {
    setInventoryItems(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Item removed",
      description: "Item has been removed from inventory.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">
            Track your current holdings and unrealized profits
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshPrices}
            className="border-primary/20 hover:bg-primary/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Prices
          </Button>
          <Button
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items Held
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {inventoryKPIs.totalItems}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(inventoryKPIs.totalCost)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Market Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(inventoryKPIs.currentMarketValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unrealized Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${inventoryKPIs.unrealizedProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {inventoryKPIs.unrealizedProfit >= 0 ? '+' : ''}{formatNumber(inventoryKPIs.unrealizedProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Holdings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Items you own but haven't sold yet
          </p>
        </CardHeader>
        <CardContent>
          {inventoryItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No items in inventory</p>
                <p className="text-sm">Add items you've bought but haven't sold yet</p>
              </div>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Date Purchased</TableHead>
                    <TableHead>Price Paid</TableHead>
                    <TableHead>Current Lowest BIN</TableHead>
                    <TableHead>Potential Profit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => {
                    const potentialProfit = calculatePotentialProfit(item);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <button 
                            className="text-primary hover:underline"
                            onClick={() => {
                              // TODO: Navigate to item analytics
                              console.log('Navigate to item analytics:', item.itemName);
                            }}
                          >
                            {item.itemName}
                          </button>
                        </TableCell>
                        <TableCell>
                          {item.datePurchased.toLocaleDateString()}
                        </TableCell>
                        <TableCell>{formatNumber(item.pricePaid)}</TableCell>
                        <TableCell>{formatNumber(item.currentLowestBin)}</TableCell>
                        <TableCell>
                          <span className={potentialProfit >= 0 ? 'text-success' : 'text-destructive'}>
                            {potentialProfit >= 0 ? '+' : ''}{formatNumber(potentialProfit)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsSold(item)}
                              className="text-success hover:bg-success/10"
                            >
                              Mark as Sold
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}