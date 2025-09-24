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
  notes?: string; // Optional notes field
  imageUrl?: string; // Optional image URL for trade
}

export interface InventoryItem {
  id: string;
  itemName: string;
  category: TradeCategory;
  datePurchased: Date;
  pricePaid: number;
  currentLowestBin: number;
  notes?: string;
  imageUrl?: string;
}

export interface UserGoals {
  daily: number;
  weekly: number;
  monthly: number;
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

export interface GameEvent {
  id: string;
  name: string;
  type: string;
  startDate: Date;
  endDate: Date;
  description?: string;
}