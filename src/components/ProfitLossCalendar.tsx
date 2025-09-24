import { useState, useMemo } from 'react';
import { Trade } from '@/types/trade';
import { formatNumber } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, getDay, subMonths, addMonths } from 'date-fns';

interface ProfitLossCalendarProps {
  trades: Trade[];
}

interface DayData {
  date: Date;
  netProfit: number;
  tradeCount: number;
  isCurrentMonth: boolean;
}

export function ProfitLossCalendar({ trades }: ProfitLossCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate padding days for the calendar grid
  const startPadding = getDay(monthStart);
  const paddingDays = Array.from({ length: startPadding }, (_, i) => {
    const paddingDate = new Date(monthStart);
    paddingDate.setDate(paddingDate.getDate() - (startPadding - i));
    return paddingDate;
  });

  const allDays = [...paddingDays, ...calendarDays];

  const dayData = useMemo(() => {
    const dataMap = new Map<string, DayData>();

    // Initialize all days with zero profit
    allDays.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      dataMap.set(dateKey, {
        date,
        netProfit: 0,
        tradeCount: 0,
        isCurrentMonth: isSameMonth(date, currentDate)
      });
    });

    // Aggregate trades by day
    trades.forEach(trade => {
      const dateKey = format(trade.dateTime, 'yyyy-MM-dd');
      const existing = dataMap.get(dateKey);
      if (existing) {
        existing.netProfit += trade.netProfit;
        existing.tradeCount += 1;
      }
    });

    return Array.from(dataMap.values());
  }, [trades, allDays, currentDate]);

  const getProfitColor = (profit: number, tradeCount: number) => {
    if (tradeCount === 0) return 'bg-muted text-muted-foreground';
    if (profit > 10000000) return 'bg-green-600 text-white'; // 10M+
    if (profit > 5000000) return 'bg-green-500 text-white';  // 5M+
    if (profit > 1000000) return 'bg-green-400 text-white';  // 1M+
    if (profit > 0) return 'bg-green-300 text-white';        // Positive
    if (profit === 0) return 'bg-gray-300 text-gray-700';    // Break even
    if (profit > -1000000) return 'bg-red-300 text-white';   // Small loss
    if (profit > -5000000) return 'bg-red-400 text-white';   // Medium loss
    return 'bg-red-600 text-white';                          // Large loss
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Profit/Loss Calendar
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="font-semibold min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Visual overview of daily trading performance. Hover over days for details.
        </p>
      </CardHeader>
      
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-7 gap-1">
            {/* Weekday headers */}
            {weekdays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {dayData.map((day, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      aspect-square p-1 rounded-lg cursor-pointer transition-all hover:scale-105
                      ${getProfitColor(day.netProfit, day.tradeCount)}
                      ${!day.isCurrentMonth ? 'opacity-30' : ''}
                    `}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center text-xs">
                      <div className="font-semibold">
                        {format(day.date, 'd')}
                      </div>
                      {day.tradeCount > 0 && (
                        <div className="text-[10px] opacity-80">
                          {day.tradeCount}
                        </div>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <div className="font-semibold">
                      {format(day.date, 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm">
                      Net Profit: <span className={day.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {day.netProfit >= 0 ? '+' : ''}{formatNumber(day.netProfit)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {day.tradeCount} trade{day.tradeCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-muted rounded"></div>
              <span>No activity</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-300 rounded"></div>
              <span>Small profit</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Good profit</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span>Excellent profit</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span>Loss</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}