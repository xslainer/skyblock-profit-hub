import { useState } from 'react';
import { Trade } from '@/types/trade';
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
import { Search } from 'lucide-react';

interface ItemHistoryProps {
  trades: Trade[];
}

export function ItemHistory({ trades }: ItemHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter trades based on search term
  const filteredTrades = trades.filter(trade =>
    trade.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort trades by date (newest first)
  const sortedTrades = [...filteredTrades].sort((a, b) => 
    new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item History</CardTitle>
        <p className="text-sm text-muted-foreground">
          All your lowballing trades sorted by most recent
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
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
            <p className="text-muted-foreground">No trades found matching "{searchTerm}"</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Lowest BIN</TableHead>
                  <TableHead>Raw Craft Cost</TableHead>
                  <TableHead>Price Paid</TableHead>
                  <TableHead>Price Sold</TableHead>
                  <TableHead>Lowball %</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTrades.map((trade) => {
                  const lowballPercent = calculateLowballPercent(trade);
                  return (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">
                        {trade.itemName}
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}