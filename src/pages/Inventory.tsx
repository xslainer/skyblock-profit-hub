import { useState, useMemo } from 'react';
import { InventoryItem } from '@/types/trade';
import { formatNumber } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Trash2, Package, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTrades } from '@/hooks/useTrades';
import { cn } from '@/lib/utils';

export function Inventory() {
  const { inventoryItems, loading, markAsSold, refetch } = useTrades();
  const { toast } = useToast();

  const inventoryKPIs = useMemo(() => {
    const totalItems = inventoryItems.length;
    const totalCost = inventoryItems.reduce((sum, item) => sum + item.pricePaid, 0);
    const currentMarketValue = inventoryItems.reduce((sum, item) => sum + item.lowestBin, 0);
    const unrealizedProfit = currentMarketValue - totalCost;

    return {
      totalItems,
      totalCost,
      currentMarketValue,
      unrealizedProfit,
    };
  }, [inventoryItems]);

  const getDaysHeld = (datePurchased: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - datePurchased.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysHeldColor = (days: number) => {
    if (days <= 3) return "text-success";
    if (days <= 10) return "text-warning";
    return "text-destructive";
  };

  const calculatePotentialProfit = (item: InventoryItem) => {
    const grossProfit = item.lowestBin - item.pricePaid;
    const ahTax = item.lowestBin * 0.01; // 1% AH tax
    return grossProfit - ahTax;
  };

  const refreshPrices = async () => {
    toast({
      title: "Refreshing prices...",
      description: "Updating current market values.",
    });
    
    await refetch();
    
    toast({
      title: "Prices updated",
      description: "All item prices have been refreshed.",
    });
  };

  const handleMarkAsSold = (item: InventoryItem) => {
    // For now, just show a placeholder - in a real app this would open a modal or navigate to a form
    const soldPrice = prompt(`Enter the price you sold ${item.itemName} for:`);
    if (soldPrice) {
      const numericPrice = parseFloat(soldPrice);
      if (!isNaN(numericPrice)) {
        markAsSold(item, numericPrice);
      }
    }
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
                    <TableHead>Category</TableHead>
                    <TableHead>Date Purchased</TableHead>
                    <TableHead>Days Held</TableHead>
                    <TableHead>Price Paid</TableHead>
                    <TableHead>Current Lowest BIN</TableHead>
                    <TableHead>Potential Profit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => {
                    const potentialProfit = calculatePotentialProfit(item);
                    const daysHeld = getDaysHeld(item.datePurchased);
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
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {item.datePurchased.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className={cn("font-medium", getDaysHeldColor(daysHeld))}>
                              {daysHeld} days
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatNumber(item.pricePaid)}</TableCell>
                        <TableCell>{formatNumber(item.lowestBin)}</TableCell>
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
                              onClick={() => handleMarkAsSold(item)}
                              className="text-success hover:bg-success/10"
                            >
                              Mark as Sold
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Implement delete functionality
                                toast({
                                  title: "Delete functionality",
                                  description: "Delete functionality will be implemented soon.",
                                });
                              }}
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