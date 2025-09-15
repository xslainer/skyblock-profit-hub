export type TradeCategory = 
  | 'Armors'
  | 'Swords'
  | 'Mage weapons'
  | 'Bows'
  | 'Skins'
  | 'Dyes'
  | 'Miscellaneous'
  | 'Accessories';

export type AuctionStatus = 'listed' | 'sold' | 'unsold';

export interface Trade {
  id: string;
  itemName: string;
  category: TradeCategory;
  lowestBin: number;
  craftCost: number;
  pricePaid: number;
  lowballPercent: number;
  soldPrice: number;
  taxPercent: number;
  taxAmount: number;
  netProfit: number;
  dateTime: Date;
  costBasis: 'lowestBin' | 'craftCost' | 'pricePaid'; // Which cost to use for profit calc
  auctionStatus: AuctionStatus;
}

export interface ProfitMetrics {
  allTime: number;
  monthly: number;
  weekly: number;
  daily: number;
}

export interface StatusStats {
  sold: number;
  listed: number;
  unsold: number;
}

export interface LeaderboardItem {
  itemName: string;
  totalProfit: number;
  averageProfit: number;
  tradeCount: number;
  trades: Trade[];
}