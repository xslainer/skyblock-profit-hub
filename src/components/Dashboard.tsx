import { useState } from 'react';
import { Trade, ProfitMetrics, LeaderboardItem, StatusStats } from '@/types/trade';
import { formatNumber } from '@/utils/calculations';
import { StatCard } from './StatCard';
import { Leaderboard } from './Leaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  trades: Trade[];
  metrics: ProfitMetrics;
  leaderboard: LeaderboardItem[];
  statusStats: StatusStats;
  onLeaderboardItemClick: (item: LeaderboardItem) => void;
  onClearAllTrades: () => void;
}

export function Dashboard({ trades, metrics, leaderboard, statusStats, onLeaderboardItemClick, onClearAllTrades }: DashboardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { toast } = useToast();

  const handleClearAllTrades = () => {
    setIsDeleting(true);
    setCountdown(10);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          onClearAllTrades();
          setIsDeleting(false);
          setCountdown(null);
          toast({
            title: "All data cleared",
            description: "All trade data has been permanently deleted",
            variant: "destructive",
          });
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelDelete = () => {
    setIsDeleting(false);
    setCountdown(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Track your Hypixel Skyblock lowballing profits and performance
          </p>
        </div>
        
        {/* Clear All Data Button */}
        {trades.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Trade Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {trades.length} trades and cannot be undone. 
                  Are you sure you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={handleClearAllTrades}
                  disabled={isDeleting}
                >
                  {isDeleting && countdown ? `Deleting in ${countdown}s...` : 'Delete All Data'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Profit Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="All Time Profit" value={metrics.allTime} className="lg:col-span-2" />
        <StatCard title="Monthly Profit" value={metrics.monthly} />
        <StatCard title="Weekly Profit" value={metrics.weekly} />
        <StatCard title="Daily Profit" value={metrics.daily} />
      </div>

      {/* Status Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Auction Status Overview</CardTitle>
          <p className="text-sm text-muted-foreground">Track your auction statuses</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-6 h-6 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Sold</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{statusStats.sold}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="w-6 h-6 rounded-full bg-yellow-500" />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Listed</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{statusStats.listed}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="w-6 h-6 rounded-full bg-red-500" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Unsold</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{statusStats.unsold}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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