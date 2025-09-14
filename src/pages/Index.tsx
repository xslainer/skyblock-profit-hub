import { useState } from 'react';
import { LeaderboardItem } from '@/types/trade';
import { useTrades } from '@/hooks/useTrades';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { AddTrade } from '@/components/AddTrade';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { trades, metrics, leaderboard, addTrade } = useTrades();
  const { toast } = useToast();

  const handleAddTrade = (newTrade: any) => {
    addTrade(newTrade);
    toast({
      title: "Trade added successfully!",
      description: `${newTrade.itemName} trade recorded with ${newTrade.netProfit >= 0 ? 'profit' : 'loss'} of ${Math.abs(newTrade.netProfit).toLocaleString()} coins`,
    });
    setActiveTab('dashboard');
  };

  const handleLeaderboardItemClick = (item: LeaderboardItem) => {
    console.log('Clicked leaderboard item:', item);
    // TODO: Implement detailed view modal/panel
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            trades={trades}
            metrics={metrics}
            leaderboard={leaderboard}
            onLeaderboardItemClick={handleLeaderboardItemClick}
          />
        );
      case 'add-trade':
        return <AddTrade onAddTrade={handleAddTrade} />;
      case 'analytics':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Analytics</h2>
            <p className="text-muted-foreground">Coming soon - Charts and analytics</p>
          </div>
        );
      case 'history':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Item History</h2>
            <p className="text-muted-foreground">Coming soon - Trade history table</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
