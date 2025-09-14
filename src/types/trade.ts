export interface Trade {
  id: string;
  itemName: string;
  lowestBin: number;
  craftCost: number;
  lowballPercent: number;
  soldPrice: number;
  taxPercent: number;
  taxAmount: number;
  netProfit: number;
  dateTime: Date;
  useLowestBin: boolean; // Whether to use lowest BIN or craft cost for profit calc
}

export interface ProfitMetrics {
  allTime: number;
  monthly: number;
  weekly: number;
  daily: number;
}

export interface LeaderboardItem {
  itemName: string;
  totalProfit: number;
  averageProfit: number;
  tradeCount: number;
  trades: Trade[];
}