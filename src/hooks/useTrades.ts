import { useState, useEffect, useMemo } from 'react';
import { Trade, ProfitMetrics, LeaderboardItem } from '@/types/trade';
import { loadTrades, saveTrades, addTrade as addTradeToStorage, updateTrade as updateTradeInStorage, deleteTrade as deleteTradeFromStorage, clearAllTrades as clearAllTradesFromStorage } from '@/utils/storage';

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);

  // Load trades on mount
  useEffect(() => {
    const loadedTrades = loadTrades();
    setTrades(loadedTrades);
  }, []);

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

  const addTrade = (newTrade: Trade) => {
    const updatedTrades = addTradeToStorage(newTrade);
    setTrades(updatedTrades);
  };

  const updateTrade = (updatedTrade: Trade) => {
    const updatedTrades = updateTradeInStorage(updatedTrade);
    setTrades(updatedTrades);
  };

  const deleteTrade = (tradeId: string) => {
    const updatedTrades = deleteTradeFromStorage(tradeId);
    setTrades(updatedTrades);
  };

  const clearAllTrades = () => {
    const updatedTrades = clearAllTradesFromStorage();
    setTrades(updatedTrades);
  };

  return {
    trades,
    metrics,
    leaderboard,
    addTrade,
    updateTrade,
    deleteTrade,
    clearAllTrades
  };
}