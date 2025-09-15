import { Trade } from '@/types/trade';

const STORAGE_KEY = 'skyblock-lowballing-trades';

export function saveTrades(trades: Trade[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  } catch (error) {
    console.error('Failed to save trades:', error);
  }
}

export function loadTrades(): Trade[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const trades = JSON.parse(stored);
    // Convert date strings back to Date objects
    return trades.map((trade: any) => ({
      ...trade,
      dateTime: new Date(trade.dateTime)
    }));
  } catch (error) {
    console.error('Failed to load trades:', error);
    return [];
  }
}

export function addTrade(newTrade: Trade): Trade[] {
  const trades = loadTrades();
  trades.push(newTrade);
  saveTrades(trades);
  return trades;
}

export function updateTrade(updatedTrade: Trade): Trade[] {
  const trades = loadTrades();
  const index = trades.findIndex(t => t.id === updatedTrade.id);
  if (index !== -1) {
    trades[index] = updatedTrade;
    saveTrades(trades);
  }
  return trades;
}

export function deleteTrade(tradeId: string): Trade[] {
  const trades = loadTrades();
  const filtered = trades.filter(t => t.id !== tradeId);
  saveTrades(filtered);
  return filtered;
}

export function clearAllTrades(): Trade[] {
  saveTrades([]);
  return [];
}