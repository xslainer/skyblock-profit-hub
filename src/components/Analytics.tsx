import { useMemo, useState } from 'react';
import { Trade } from '@/types/trade';
import { formatNumber } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/simple-chart';

interface AnalyticsProps {
  trades: Trade[];
}

type TimeRange = 'day' | 'week' | 'month' | 'year';

export function Analytics({ trades }: AnalyticsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('month');

  // Get filtered trades based on time range
  const getDateRange = (range: TimeRange) => {
    const now = new Date();
    switch (range) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
  };

  const filteredTrades = useMemo(() => {
    const startDate = getDateRange(selectedTimeRange);
    return trades.filter(trade => trade.dateTime >= startDate);
  }, [trades, selectedTimeRange]);

  // Profit over time data
  const profitOverTime = useMemo(() => {
    const dataMap = new Map<string, number>();
    
    filteredTrades.forEach(trade => {
      const dateKey = trade.dateTime.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentProfit = dataMap.get(dateKey) || 0;
      dataMap.set(dateKey, currentProfit + trade.netProfit);
    });

    return Array.from(dataMap.entries())
      .map(([date, profit]) => ({
        date: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }) as string,
        profit: Math.round(profit)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredTrades]);

  // Items traded per day data
  const itemsPerDay = useMemo(() => {
    const dataMap = new Map<string, number>();
    
    filteredTrades.forEach(trade => {
      const dateKey = trade.dateTime.toISOString().split('T')[0];
      const currentCount = dataMap.get(dateKey) || 0;
      dataMap.set(dateKey, currentCount + 1);
    });

    return Array.from(dataMap.entries())
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }) as string,
        items: count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredTrades]);

  // Calculate averages
  const averages = useMemo(() => {
    if (filteredTrades.length === 0) {
      return {
        avgPriceSold: 0,
        avgLowballPercent: 0,
        avgProfitPerItem: 0
      };
    }

    const totalPriceSold = filteredTrades.reduce((sum, trade) => sum + trade.soldPrice, 0);
    const totalLowballPercent = filteredTrades.reduce((sum, trade) => sum + trade.lowballPercent, 0);
    const totalProfit = filteredTrades.reduce((sum, trade) => sum + trade.netProfit, 0);

    return {
      avgPriceSold: totalPriceSold / filteredTrades.length,
      avgLowballPercent: totalLowballPercent / filteredTrades.length,
      avgProfitPerItem: totalProfit / filteredTrades.length
    };
  }, [filteredTrades]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Detailed insights into your lowballing performance
          </p>
        </div>
        
        {/* Time Range Selector */}
        <Select value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as TimeRange)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border shadow-lg z-50">
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Averages Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Price Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatNumber(averages.avgPriceSold)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per item in {selectedTimeRange === 'day' ? 'last 24h' : `last ${selectedTimeRange}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Lowball %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {averages.avgLowballPercent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average discount received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Profit per Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${averages.avgProfitPerItem >= 0 ? 'text-success' : 'text-destructive'}`}>
              {averages.avgProfitPerItem >= 0 ? '+' : ''}{formatNumber(averages.avgProfitPerItem)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per trade on average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Profit Over Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Over Time</CardTitle>
            <p className="text-sm text-muted-foreground">
              Daily profit trends for the selected period
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitOverTime}>
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

        {/* Items Lowballed Per Day */}
        <Card>
          <CardHeader>
            <CardTitle>Items Lowballed Per Day</CardTitle>
            <p className="text-sm text-muted-foreground">
              Trading volume over the selected period
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itemsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs fill-muted-foreground" 
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground"
                  />
                  <Tooltip
                    content={({ active, payload, label }) => (
                      <ChartTooltip
                        active={active}
                        payload={payload?.map(item => ({
                          ...item,
                          name: 'Items Traded',
                          value: `${item.value} items`,
                          color: item.color
                        }))}
                        label={label?.toString()}
                      />
                    )}
                  />
                  <Bar 
                    dataKey="items" 
                    fill="hsl(var(--accent))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Period Summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            Overview of your performance in the selected time range
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{filteredTrades.length}</div>
              <div className="text-sm text-muted-foreground">Total Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {filteredTrades.filter(t => t.netProfit > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Profitable Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {filteredTrades.filter(t => t.netProfit < 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Loss Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {filteredTrades.length > 0 
                  ? ((filteredTrades.filter(t => t.netProfit > 0).length / filteredTrades.length) * 100).toFixed(1)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}