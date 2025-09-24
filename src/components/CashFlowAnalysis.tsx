import { useMemo } from 'react';
import { Trade, InventoryItem } from '@/types/trade';
import { formatNumber } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown, TrendingUp, DollarSign } from 'lucide-react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';

interface CashFlowAnalysisProps {
  trades: Trade[];
  inventory: InventoryItem[];
}

export function CashFlowAnalysis({ trades, inventory }: CashFlowAnalysisProps) {
  const cashFlowData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 6); // Last 7 days
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map(day => {
      // Money in from sales (completed trades)
      const salesForDay = trades.filter(trade => isSameDay(trade.dateTime, day));
      const moneyIn = salesForDay.reduce((sum, trade) => sum + trade.soldPrice, 0);

      // Money out from purchases (both completed trades and current inventory)
      const purchasesFromTrades = salesForDay.reduce((sum, trade) => {
        const costBasisValue = trade.costBasis === 'lowestBin' ? trade.lowestBin : 
                             trade.costBasis === 'craftCost' ? trade.craftCost : trade.pricePaid;
        return sum + costBasisValue;
      }, 0);

      const purchasesFromInventory = inventory
        .filter(item => isSameDay(item.datePurchased, day))
        .reduce((sum, item) => sum + item.pricePaid, 0);

      const moneyOut = purchasesFromTrades + purchasesFromInventory;

      return {
        date: format(day, 'MMM dd'),
        fullDate: day,
        moneyIn,
        moneyOut,
        netFlow: moneyIn - moneyOut
      };
    });
  }, [trades, inventory]);

  const weeklyTotals = useMemo(() => {
    const totalMoneyIn = cashFlowData.reduce((sum, day) => sum + day.moneyIn, 0);
    const totalMoneyOut = cashFlowData.reduce((sum, day) => sum + day.moneyOut, 0);
    const netCashFlow = totalMoneyIn - totalMoneyOut;

    return { totalMoneyIn, totalMoneyOut, netCashFlow };
  }, [cashFlowData]);

  const formatTooltipValue = (value: number, name: string) => {
    const formattedValue = formatNumber(Math.abs(value));
    return [formattedValue, name];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Cash Flow Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Money movement in and out of your trading account (last 7 days)
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <h4 className="font-semibold">Money In</h4>
            </div>
            <p className="text-2xl font-bold text-green-500">
              +{formatNumber(weeklyTotals.totalMoneyIn)}
            </p>
            <p className="text-xs text-muted-foreground">From sales</p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <h4 className="font-semibold">Money Out</h4>
            </div>
            <p className="text-2xl font-bold text-red-500">
              -{formatNumber(weeklyTotals.totalMoneyOut)}
            </p>
            <p className="text-xs text-muted-foreground">From purchases</p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              <h4 className="font-semibold">Net Flow</h4>
            </div>
            <p className={`text-2xl font-bold ${weeklyTotals.netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {weeklyTotals.netCashFlow >= 0 ? '+' : ''}{formatNumber(weeklyTotals.netCashFlow)}
            </p>
            <p className="text-xs text-muted-foreground">Weekly total</p>
          </div>
        </div>

        {/* Cash Flow Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs" 
                tickLine={false}
              />
              <YAxis 
                className="text-xs"
                tickLine={false}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelClassName="text-sm font-medium"
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="moneyIn" 
                name="Money In" 
                fill="hsl(var(--success))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="moneyOut" 
                name="Money Out" 
                fill="hsl(var(--destructive))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Cash Flow Insights</h4>
          <div className="space-y-1 text-sm">
            {weeklyTotals.netCashFlow > 0 && (
              <p className="text-green-600">✓ Positive cash flow - you're generating more than you're spending</p>
            )}
            {weeklyTotals.netCashFlow < 0 && (
              <p className="text-red-600">⚠ Negative cash flow - you're spending more than you're earning</p>
            )}
            {weeklyTotals.totalMoneyOut > weeklyTotals.totalMoneyIn * 2 && (
              <p className="text-orange-600">⚠ High spending ratio - consider slowing down purchases</p>
            )}
            {weeklyTotals.totalMoneyIn === 0 && (
              <p className="text-gray-600">No sales recorded this week - focus on selling current inventory</p>
            )}
            {weeklyTotals.totalMoneyOut === 0 && weeklyTotals.totalMoneyIn > 0 && (
              <p className="text-blue-600">Only sales this week - good liquidation period</p>
            )}
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-2">
          <h4 className="font-semibold">Daily Breakdown</h4>
          <div className="space-y-1">
            {cashFlowData.map((day, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-2 hover:bg-muted rounded">
                <span className="font-medium">{day.date}</span>
                <div className="flex items-center gap-4">
                  <span className="text-green-600">+{formatNumber(day.moneyIn)}</span>
                  <span className="text-red-600">-{formatNumber(day.moneyOut)}</span>
                  <span className={`font-medium ${day.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {day.netFlow >= 0 ? '+' : ''}{formatNumber(day.netFlow)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}