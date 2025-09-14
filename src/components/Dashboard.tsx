import { Trade, ProfitMetrics, LeaderboardItem } from '@/types/trade';
import { StatCard } from './StatCard';
import { Leaderboard } from './Leaderboard';
import { formatNumber } from '@/utils/calculations';

interface DashboardProps {
  trades: Trade[];
  metrics: ProfitMetrics;
  leaderboard: LeaderboardItem[];
  onLeaderboardItemClick: (item: LeaderboardItem) => void;
}

export function Dashboard({ trades, metrics, leaderboard, onLeaderboardItemClick }: DashboardProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Track your Hypixel Skyblock lowballing profits and performance
        </p>
      </div>

      {/* Profit Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="All Time Profit"
          value={metrics.allTime}
          subtitle={`${trades.length} total trades`}
          variant={metrics.allTime >= 0 ? 'profit' : 'loss'}
        />
        <StatCard
          title="Monthly Profit"
          value={metrics.monthly}
          subtitle="Last 30 days"
          variant={metrics.monthly >= 0 ? 'profit' : 'loss'}
        />
        <StatCard
          title="Weekly Profit"
          value={metrics.weekly}
          subtitle="Last 7 days"
          variant={metrics.weekly >= 0 ? 'profit' : 'loss'}
        />
        <StatCard
          title="Daily Profit"
          value={metrics.daily}
          subtitle="Last 24 hours"
          variant={metrics.daily >= 0 ? 'profit' : 'loss'}
        />
      </div>

      {/* Top 5 Most Profitable Items */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Leaderboard
            items={leaderboard}
            onItemClick={onLeaderboardItemClick}
          />
        </div>
        
        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Profit/Trade</span>
                <span className="font-medium text-success">
                  +{formatNumber(trades.length ? metrics.allTime / trades.length : 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best Trade</span>
                <span className="font-medium text-success">
                  +{formatNumber(Math.max(...trades.map(t => t.netProfit), 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Worst Trade</span>
                <span className="font-medium text-destructive">
                  {formatNumber(Math.min(...trades.map(t => t.netProfit), 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Profitable Trades</span>
                <span className="font-medium">
                  {trades.filter(t => t.netProfit > 0).length}/{trades.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}