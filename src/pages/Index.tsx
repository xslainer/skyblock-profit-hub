import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LeaderboardItem } from '@/types/trade';
import { useTrades } from '@/hooks/useTrades';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { AddTrade } from '@/components/AddTrade';
import { ItemHistoryFiltered } from '@/components/ItemHistoryFiltered';
import { Analytics } from '@/components/Analytics';
import { ProfileSettings } from '@/components/ProfileSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, LogOut, Loader2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { trades, loading, metrics, leaderboard, addTrade, deleteTrade, clearAllTrades } = useTrades();
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
      navigate('/auth');
    }
  };

  const handleAddTrade = async (newTrade: any) => {
    await addTrade(newTrade);
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

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-primary/10">
          <CardHeader className="text-center space-y-4">
            <div className="bg-gradient-primary p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to Skyblock Lowballing</CardTitle>
            <p className="text-muted-foreground">
              Sign in to sync your trades across all devices and access your data from anywhere.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              asChild 
              className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-all duration-200"
            >
              <Link to="/auth">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In / Sign Up
              </Link>
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <p>✓ Secure cloud storage</p>
              <p>✓ Access from any device</p>
              <p>✓ Real-time data sync</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            trades={trades}
            metrics={metrics}
            leaderboard={leaderboard}
            onLeaderboardItemClick={handleLeaderboardItemClick}
            onClearAllTrades={clearAllTrades}
          />
        );
      case 'add-trade':
        return <AddTrade onAddTrade={handleAddTrade} />;
      case 'analytics':
        return <Analytics trades={trades} />;
      case 'history':
        return <ItemHistoryFiltered trades={trades} onDeleteTrade={deleteTrade} />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with user info and sign out */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
                Skyblock Lowballing Tracker
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {profile?.display_name || profile?.username || user?.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setActiveTab('profile')}
                variant="outline"
                size="sm"
                className="border-primary/20 hover:bg-primary/10"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-primary/20 hover:bg-primary/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-8">
        {loading && activeTab === 'dashboard' ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-2">Loading your trades...</p>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

export default Index;