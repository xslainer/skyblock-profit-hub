import { useState, useEffect, useMemo } from 'react';
import { Trade, ProfitMetrics, LeaderboardItem, InventoryItem } from '@/types/trade';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { calculateProfit } from '@/utils/calculations';

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Fetch trades from Supabase
  const fetchTrades = async () => {
    if (!isAuthenticated || !user) {
      setTrades([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('date_time', { ascending: false });

      if (error) {
        console.error('Error fetching trades:', error);
        toast({
          title: "Error loading trades",
          description: "Failed to load your trade history. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Convert database format to frontend format
      const formattedTrades: Trade[] = (data || []).map(trade => ({
        id: trade.id,
        itemName: trade.item_name,
        category: trade.category as any,
        lowestBin: trade.lowest_bin,
        craftCost: trade.craft_cost,
        pricePaid: trade.price_paid,
        ahAverageValue: trade.ah_average_value,
        lowballPercent: trade.lowball_percent,
        soldPrice: trade.sold_price,
        taxPercent: trade.tax_percent,
        taxAmount: trade.tax_amount,
        netProfit: trade.net_profit,
        dateTime: new Date(trade.date_time),
        dateSold: (trade as any).date_sold ? new Date((trade as any).date_sold) : undefined,
        costBasis: trade.cost_basis as any,
        lowballBasis: trade.lowball_basis as any,
        status: (trade as any).status || 'completed',
      }));

      // Separate completed trades from inventory items
      const completedTrades = formattedTrades.filter(trade => trade.status === 'completed');
      const inventoryTrades = formattedTrades.filter(trade => trade.status === 'inventory');
      
      console.log('Total trades fetched:', formattedTrades.length);
      console.log('Completed trades:', completedTrades.length);
      console.log('Inventory trades:', inventoryTrades.length);
      console.log('Inventory items:', inventoryTrades);
      
      // Convert inventory trades to inventory items
      const formattedInventory: InventoryItem[] = inventoryTrades.map(trade => ({
        id: trade.id,
        itemName: trade.itemName,
        category: trade.category,
        datePurchased: trade.dateTime,
        pricePaid: trade.pricePaid,
        lowestBin: trade.lowestBin,
        craftCost: trade.craftCost,
        ahAverageValue: trade.ahAverageValue,
        lowballPercent: trade.lowballPercent,
        lowballBasis: trade.lowballBasis,
        notes: trade.notes,
        imageUrl: trade.imageUrl,
      }));

      setTrades(completedTrades);
      setInventoryItems(formattedInventory);
      console.log('Set inventory items to:', formattedInventory);
    } catch (error) {
      console.error('Error in fetchTrades:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading trades.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate profit metrics
  const metrics = useMemo((): ProfitMetrics => {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      allTime: trades.reduce((sum, trade) => sum + trade.netProfit, 0),
      daily: trades
        .filter(trade => trade.dateTime >= dayAgo)
        .reduce((sum, trade) => sum + trade.netProfit, 0),
      weekly: trades
        .filter(trade => trade.dateTime >= weekAgo)
        .reduce((sum, trade) => sum + trade.netProfit, 0),
      monthly: trades
        .filter(trade => trade.dateTime >= monthAgo)
        .reduce((sum, trade) => sum + trade.netProfit, 0),
    };
  }, [trades]);

  // Generate leaderboard of items by profit
  const leaderboard = useMemo((): LeaderboardItem[] => {
    const itemGroups = trades.reduce((groups, trade) => {
      const key = trade.itemName;
      if (!groups[key]) {
        groups[key] = {
          itemName: key,
          totalProfit: 0,
          averageProfit: 0,
          tradeCount: 0,
          trades: []
        };
      }
      
      groups[key].totalProfit += trade.netProfit;
      groups[key].tradeCount += 1;
      groups[key].trades.push(trade);
      
      return groups;
    }, {} as Record<string, LeaderboardItem>);

    return Object.values(itemGroups)
      .map(item => ({
        ...item,
        averageProfit: item.totalProfit / item.tradeCount
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit);
  }, [trades]);

  // Add a new trade to Supabase
  const addTrade = async (trade: Trade) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add trades.",
        variant: "destructive",
      });
      return false;
    }

    console.log('Adding trade for user:', user.id, 'Trade data:', trade);

    try {
      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          item_name: trade.itemName,
          category: trade.category,
          lowest_bin: trade.lowestBin,
          craft_cost: trade.craftCost,
          price_paid: trade.pricePaid,
          ah_average_value: trade.ahAverageValue,
          lowball_percent: trade.lowballPercent,
          sold_price: trade.soldPrice,
          tax_percent: trade.taxPercent,
          tax_amount: trade.taxAmount,
          net_profit: trade.netProfit,
          date_time: trade.dateTime.toISOString(),
          date_sold: trade.dateSold?.toISOString(),
          cost_basis: trade.costBasis,
          lowball_basis: trade.lowballBasis,
          status: trade.status,
        })
        .select();

      if (error) {
        console.error('Error adding trade:', error);
        toast({
          title: "Error adding trade",
          description: `Failed to save your trade: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Trade added successfully:', data);
      
      toast({
        title: "Trade added",
        description: "Your trade has been successfully recorded.",
      });

      // Refresh trades list
      await fetchTrades();
      return true;
    } catch (error) {
      console.error('Error in addTrade:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding the trade.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a trade from Supabase
  const deleteTrade = async (tradeId: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete trades.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId)
        .eq('user_id', user.id); // Ensure user can only delete their own trades

      if (error) {
        console.error('Error deleting trade:', error);
        toast({
          title: "Error deleting trade",
          description: "Failed to delete the trade. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Refresh trades list
      await fetchTrades();
      
      toast({
        title: "Trade deleted",
        description: "The trade has been successfully removed.",
      });
    } catch (error) {
      console.error('Error in deleteTrade:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the trade.",
        variant: "destructive",
      });
    }
  };

  // Update an existing trade in Supabase
  const updateTrade = async (updatedTrade: Trade): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update trades.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('trades')
        .update({
          item_name: updatedTrade.itemName,
          category: updatedTrade.category,
          lowest_bin: updatedTrade.lowestBin,
          craft_cost: updatedTrade.craftCost,
          price_paid: updatedTrade.pricePaid,
          ah_average_value: updatedTrade.ahAverageValue,
          lowball_percent: updatedTrade.lowballPercent,
          sold_price: updatedTrade.soldPrice,
          tax_percent: updatedTrade.taxPercent,
          tax_amount: updatedTrade.taxAmount,
          net_profit: updatedTrade.netProfit,
          date_sold: updatedTrade.dateSold?.toISOString(),
          cost_basis: updatedTrade.costBasis,
          lowball_basis: updatedTrade.lowballBasis,
          status: updatedTrade.status,
        })
        .eq('id', updatedTrade.id)
        .eq('user_id', user.id); // Ensure user can only update their own trades

      if (error) {
        console.error('Error updating trade:', error);
        toast({
          title: "Error updating trade",
          description: "Failed to update the trade. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Refresh trades list
      await fetchTrades();
      
      toast({
        title: "Trade updated",
        description: "The trade has been successfully updated.",
      });
      
      return true;
    } catch (error) {
      console.error('Error in updateTrade:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the trade.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Clear all trades (optional method for compatibility)
  const clearAllTrades = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to clear trades.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing trades:', error);
        toast({
          title: "Error clearing trades",
          description: "Failed to clear all trades. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Refresh trades list
      await fetchTrades();
      
      toast({
        title: "All trades cleared",
        description: "All your trades have been successfully removed.",
      });
    } catch (error) {
      console.error('Error in clearAllTrades:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while clearing trades.",
        variant: "destructive",
      });
    }
  };

  // Load trades when component mounts or user changes
  useEffect(() => {
    fetchTrades();
  }, [user, isAuthenticated]);

  // Add multiple trades at once
  const addTrades = async (tradesToAdd: Trade[]): Promise<boolean> => {
    try {
      for (const trade of tradesToAdd) {
        const success = await addTrade(trade);
        if (!success) return false;
      }
      return true;
    } catch (error) {
      console.error('Error adding trades:', error);
      return false;
    }
  };

  // Convert inventory item to completed trade
  const markAsSold = async (inventoryItem: InventoryItem, soldPrice: number, dateSold: Date = new Date()): Promise<boolean> => {
    const { taxPercent, taxAmount, netProfit } = calculateProfit(soldPrice, inventoryItem.pricePaid);
    
    const completedTrade: Trade = {
      id: inventoryItem.id,
      itemName: inventoryItem.itemName,
      category: inventoryItem.category,
      lowestBin: inventoryItem.lowestBin,
      craftCost: inventoryItem.craftCost,
      pricePaid: inventoryItem.pricePaid,
      ahAverageValue: inventoryItem.ahAverageValue,
      lowballPercent: inventoryItem.lowballPercent,
      soldPrice: soldPrice,
      taxPercent,
      taxAmount,
      netProfit,
      dateTime: inventoryItem.datePurchased,
      dateSold: dateSold,
      costBasis: 'pricePaid',
      lowballBasis: inventoryItem.lowballBasis,
      status: 'completed',
      notes: inventoryItem.notes,
      imageUrl: inventoryItem.imageUrl,
    };

    return await updateTrade(completedTrade);
  };

  return {
    trades,
    inventoryItems,
    loading,
    metrics,
    leaderboard,
    addTrade,
    addTrades,
    updateTrade,
    deleteTrade,
    clearAllTrades,
    markAsSold,
    refetch: fetchTrades,
  };
}