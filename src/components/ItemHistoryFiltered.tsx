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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, Trash2, Calendar as CalendarIcon, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EditTradeDialog } from './EditTradeDialog';

interface ItemHistoryFilteredProps {
  trades: Trade[];
  onDeleteTrade: (tradeId: string) => void;
  onUpdateTrade?: (updatedTrade: Trade) => Promise<boolean>;
}

type TimeFilter = 'day' | 'week' | 'month' | 'year';

export function ItemHistoryFiltered({ trades, onDeleteTrade, onUpdateTrade }: ItemHistoryFilteredProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TradeCategory | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const { toast } = useToast();

  const categories: TradeCategory[] = [
    'Armors', 'Swords', 'Bows', 'Skins', 'Dyes', 'Miscellaneous', 'Accessories'
  ];

  // Get date range based on filter
  const getFilteredTrades = () => {
    const now = new Date();
    let startDate: Date;
    
    if (selectedDate && (timeFilter === 'month' || timeFilter === 'year')) {
      // Use selected date as reference point
      if (timeFilter === 'month') {
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      } else { // year
        startDate = new Date(selectedDate.getFullYear(), 0, 1);
      }
    } else {
      // Use current date as reference
      switch (timeFilter) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
    }

    let endDate: Date;
    if (selectedDate && (timeFilter === 'month' || timeFilter === 'year')) {
      if (timeFilter === 'month') {
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      } else { // year
        endDate = new Date(selectedDate.getFullYear(), 11, 31);
      }
    } else {
      endDate = now;
    }

    return trades.filter(trade => {
      const tradeDate = new Date(trade.dateTime);
      const matchesTimeRange = tradeDate >= startDate && tradeDate <= endDate;
      const matchesSearch = trade.itemName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || trade.category === selectedCategory;
      
      return matchesTimeRange && matchesSearch && matchesCategory;
    });
  };

  const filteredTrades = getFilteredTrades();

  // Sort trades by date (newest first)
  const sortedTrades = [...filteredTrades].sort((a, b) => 
    new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

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

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return selectedDate ? format(selectedDate, 'MMMM yyyy') : 'This Month';
      case 'year': return selectedDate ? format(selectedDate, 'yyyy') : 'This Year';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item History - {getTimeFilterLabel()}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Browse your trades with advanced filtering options
        </p>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Category Filter */}
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
          
          {/* Time Filter */}
          <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-lg z-50">
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Date Picker for Month/Year */}
          {(timeFilter === 'month' || timeFilter === 'year') && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    timeFilter === 'month' 
                      ? format(selectedDate, "MMMM yyyy")
                      : format(selectedDate, "yyyy")
                  ) : (
                    <span>Pick a {timeFilter}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          )}
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
              No trades found for {getTimeFilterLabel().toLowerCase()}
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or date range
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
                  <TableHead>Net Profit</TableHead>
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
                      <TableCell>
                        <span className={`font-medium ${
                          trade.netProfit >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {trade.netProfit >= 0 ? '+' : ''}{formatNumber(trade.netProfit)}
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