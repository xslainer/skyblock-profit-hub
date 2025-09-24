import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trade } from '@/types/trade';
import { formatNumber } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/simple-chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTrades } from '@/hooks/useTrades';

export function ItemAnalytics() {
  const { itemName } = useParams<{ itemName: string }>();
  const navigate = useNavigate();
  const { trades, deleteTrade, updateTrade } = useTrades();

  const itemTrades = useMemo(() => {
    if (!itemName) return [];
    return trades.filter(trade => trade.itemName === decodeURIComponent(itemName));
  }, [trades, itemName]);

  const itemKPIs = useMemo(() => {
    if (itemTrades.length === 0) {
      return {
        totalTrades: 0,
        totalProfit: 0,
        averageProfit: 0,
        averageLowballPercent: 0,
        averageHoldTime: 0,
      };
    }

    const totalProfit = itemTrades.reduce((sum, trade) => sum + trade.netProfit, 0);
    const averageProfit = totalProfit / itemTrades.length;
    const averageLowballPercent = itemTrades.reduce((sum, trade) => sum + trade.lowballPercent, 0) / itemTrades.length;
    
    // Calculate average hold time (assuming dateTime is when sold, need purchase date)
    // For now, we'll show a placeholder as we don't have purchase date separately
    const averageHoldTime = 0; // TODO: Implement when we have purchase date

    return {
      totalTrades: itemTrades.length,
      totalProfit,
      averageProfit,
      averageLowballPercent,
      averageHoldTime,
    };
  }, [itemTrades]);

  const profitOverTimeData = useMemo(() => {
    return itemTrades
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
      .map(trade => ({
        date: trade.dateTime.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        profit: trade.netProfit,
        fullDate: trade.dateTime.toISOString(),
      }));
  }, [itemTrades]);

  if (!itemName) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Item not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const decodedItemName = decodeURIComponent(itemName);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Analytics for: {decodedItemName}
            </h1>
            <p className="text-muted-foreground">
              Detailed performance breakdown for this specific item
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {itemKPIs.totalTrades}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${itemKPIs.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {itemKPIs.totalProfit >= 0 ? '+' : ''}{formatNumber(itemKPIs.totalProfit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Profit per Trade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${itemKPIs.averageProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {itemKPIs.averageProfit >= 0 ? '+' : ''}{formatNumber(itemKPIs.averageProfit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Lowball %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              itemKPIs.averageLowballPercent > 0 ? 'text-success' : 
              itemKPIs.averageLowballPercent < 0 ? 'text-destructive' : 'text-foreground'
            }`}>
              {itemKPIs.averageLowballPercent !== 0 ? 
                `${itemKPIs.averageLowballPercent >= 0 ? '+' : ''}${itemKPIs.averageLowballPercent.toFixed(1)}%` : 
                '0%'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Hold Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              N/A
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profitability Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Profitability Over Time</CardTitle>
          <p className="text-sm text-muted-foreground">
            Net profit for each trade of {decodedItemName} over time
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs fill-muted-foreground" 
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltip
                      active={active}
                      payload={payload?.map(item => ({
                        ...item,
                        name: 'Profit',
                        value: formatNumber(item.value as number),
                        color: item.color
                      }))}
                      label={label?.toString()}
                    />
                  )}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Trade History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <p className="text-sm text-muted-foreground">
            All trades for {decodedItemName}
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Price Paid</TableHead>
                  <TableHead>Sold Price</TableHead>
                  <TableHead>Lowball %</TableHead>
                  <TableHead>Net Profit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">
                      {trade.dateTime.toLocaleDateString()}
                    </TableCell>
                    <TableCell>{formatNumber(trade.pricePaid)}</TableCell>
                    <TableCell>{formatNumber(trade.soldPrice)}</TableCell>
                    <TableCell>
                      <Badge variant={trade.lowballPercent >= 0 ? "default" : "destructive"}>
                        {trade.lowballPercent >= 0 ? '+' : ''}{trade.lowballPercent.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={trade.netProfit >= 0 ? 'text-success' : 'text-destructive'}>
                        {trade.netProfit >= 0 ? '+' : ''}{formatNumber(trade.netProfit)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement edit functionality
                            console.log('Edit trade:', trade.id);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTrade(trade.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}