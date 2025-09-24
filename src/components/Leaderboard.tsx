import { LeaderboardItem } from '@/types/trade';
import { formatNumber } from '@/utils/calculations';
import { TrendingUp, Package, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  items: LeaderboardItem[];
  onItemClick: (item: LeaderboardItem) => void;
}

export function Leaderboard({ items, onItemClick }: LeaderboardProps) {
  const topItems = items.slice(0, 5);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Top 5 Most Profitable Items</h3>
      </div>

      {topItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No trades yet</p>
          <p className="text-sm text-muted-foreground">Start adding trades to see your leaderboard</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topItems.map((item, index) => (
            <button
              key={item.itemName}
              onClick={() => onItemClick(item)}
              className={cn(
                "w-full p-4 rounded-lg border bg-muted/50 hover:bg-muted transition-all duration-200",
                "hover:shadow-hover hover:scale-[1.02] group cursor-pointer",
                index === 0 && "bg-gradient-gold/10 border-accent/30"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    index === 0 ? "bg-gradient-gold text-accent-foreground" :
                    index === 1 ? "bg-muted-foreground/20 text-foreground" :
                    index === 2 ? "bg-accent/20 text-accent-foreground" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                   <div className="text-left">
                      <div 
                        className="font-medium text-primary hover:underline text-left cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/item/${encodeURIComponent(item.itemName)}`;
                        }}
                      >
                        {item.itemName}
                      </div>
                    <p className="text-xs text-muted-foreground">
                      {item.tradeCount} trades • Avg: +{formatNumber(item.averageProfit)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-success">
                      +{formatNumber(item.totalProfit)}
                    </p>
                  </div>
                  <BarChart3 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}