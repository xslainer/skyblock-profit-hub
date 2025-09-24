export type TradeCategory = 
  | 'Armors'
  | 'Swords'
  | 'Bows'
  | 'Skins'
  | 'Dyes'
  | 'Miscellaneous'
  | 'Accessories';

export interface Trade {
  id: string;
  itemName: string;
  category: TradeCategory;
  lowestBin: number;
  craftCost: number;
  pricePaid: number;
  ahAverageValue: number;
  lowballPercent: number;
  soldPrice: number;
  taxPercent: number;
  taxAmount: number;
  netProfit: number;
  dateTime: Date;
  costBasis: 'lowestBin' | 'craftCost' | 'pricePaid'; // Which cost to use for profit calc
  lowballBasis: 'lowestBin' | 'craftCost'; // Which price to use for lowball % calculation
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