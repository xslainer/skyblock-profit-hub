import { useState, useEffect, useMemo } from 'react';
import { Trade, ProfitMetrics, LeaderboardItem } from '@/types/trade';
import { loadTrades, saveTrades } from '@/utils/storage';

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

  // Calculate leaderboard
  const leaderboard = useMemo((): LeaderboardItem[] => {
    const itemMap = new Map<string, Trade[]>();
    
    // Group trades by item name
    trades.forEach(trade => {
      const key = trade.itemName.toLowerCase();
      if (!itemMap.has(key)) {
        itemMap.set(key, []);
      }
      itemMap.get(key)!.push(trade);
    });

    // Calculate stats for each item
    const items: LeaderboardItem[] = [];
    itemMap.forEach((itemTrades, itemName) => {
      const totalProfit = itemTrades.reduce((sum, trade) => sum + trade.netProfit, 0);
      const averageProfit = totalProfit / itemTrades.length;
      
      items.push({
        itemName: itemTrades[0].itemName, // Use original casing from first trade
        totalProfit,
        averageProfit,
        tradeCount: itemTrades.length,
        trades: itemTrades.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime()),
      });
    });

    // Sort by total profit descending
    return items.sort((a, b) => b.totalProfit - a.totalProfit);
  }, [trades]);

  const addTrade = (newTrade: Trade) => {
    const updatedTrades = [...trades, newTrade];
    setTrades(updatedTrades);
    saveTrades(updatedTrades);
  };

  const updateTrade = (updatedTrade: Trade) => {
    const updatedTrades = trades.map(trade => 
      trade.id === updatedTrade.id ? updatedTrade : trade
    );
    setTrades(updatedTrades);
    saveTrades(updatedTrades);
  };

  const deleteTrade = (tradeId: string) => {
    const updatedTrades = trades.filter(trade => trade.id !== tradeId);
    setTrades(updatedTrades);
    saveTrades(updatedTrades);
  };

  return {
    trades,
    metrics,
    leaderboard,
    addTrade,
    updateTrade,
    deleteTrade,
  };
}