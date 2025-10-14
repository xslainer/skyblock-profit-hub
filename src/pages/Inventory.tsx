import { useState, useMemo } from 'react';
import { InventoryItem, TradeCategory } from '@/types/trade';
import { formatNumber } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RefreshCw, Plus, Trash2, Package, Clock, Search, Filter, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTrades } from '@/hooks/useTrades';
import { cn } from '@/lib/utils';
import { MarkAsSoldDialog } from '@/components/MarkAsSoldDialog';
import { useNavigate } from 'react-router-dom';

export function Inventory() {
  const { inventoryItems, loading, markAsSold, refetch, deleteTrade } = useTrades();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TradeCategory | 'all'>('all');

  const categories: TradeCategory[] = [
    'Armors', 'Swords', 'Bows', 'Skins', 'Dyes', 'Miscellaneous', 'Accessories'
  ];

  // Filter inventory items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventoryItems, searchTerm, selectedCategory]);

  // Sort by date (newest first)
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => 
      new Date(b.datePurchased).getTime() - new Date(a.datePurchased).getTime()
    );
  }, [filteredItems]);

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
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleConfirmSale = async (item: InventoryItem, soldPrice: number, dateSold: Date) => {
    await markAsSold(item, soldPrice, dateSold);
    toast({
      title: "Sale completed!",
      description: `${item.itemName} has been moved to trade history.`,
    });
  };

  const handleDelete = async (item: InventoryItem) => {
    await deleteTrade(item.id);
    toast({
      title: "Item removed",
      description: `${item.itemName} has been deleted from your inventory.`,
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
            onClick={() => navigate('/add-trade')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
          {inventoryItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No items in inventory</p>
                <p className="text-sm">Add items you've bought but haven't sold yet</p>
              </div>
              <Button 
                className="bg-gradient-primary hover:opacity-90"
                onClick={() => navigate('/add-trade')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No items found {searchTerm && `matching "${searchTerm}"`} {selectedCategory !== 'all' && `in ${selectedCategory} category`}
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
                    <TableHead>Lowball %</TableHead>
                    <TableHead>Date Purchased</TableHead>
                    <TableHead>Days Held</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((item) => {
                    const daysHeld = getDaysHeld(item.datePurchased);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <button 
                            className="text-primary hover:underline"
                            onClick={() => {
                              window.location.href = `/item/${encodeURIComponent(item.itemName)}`;
                            }}
                          >
                            {item.itemName}
                          </button>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {item.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.lowestBin > 0 ? formatNumber(item.lowestBin) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {item.craftCost > 0 ? formatNumber(item.craftCost) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {formatNumber(item.pricePaid)}
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            item.lowballPercent > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {item.lowballPercent}%
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
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
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsSold(item)}
                              className="h-8 w-8 text-success hover:text-success-foreground hover:bg-success"
                              title="Mark as Sold"
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
                                  <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{item.itemName}" from inventory? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDelete(item)}
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
      </Card>

      {/* Mark as Sold Dialog */}
      <MarkAsSoldDialog
        item={selectedItem}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConfirmSale}
      />
    </div>
  );
}