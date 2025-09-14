// Hypixel Auction House tax calculation
export function calculateTax(soldPrice: number): { taxPercent: number; taxAmount: number } {
  let taxPercent: number;
  
  if (soldPrice < 10_000_000) {
    taxPercent = 2;
  } else if (soldPrice <= 100_000_000) {
    taxPercent = 3;
  } else {
    taxPercent = 3.5;
  }
  
  const taxAmount = soldPrice * (taxPercent / 100);
  
  return { taxPercent, taxAmount };
}

// Parse shorthand notation (1k, 1m, 1b) to actual numbers
export function parseShorthand(value: string): number {
  const cleanValue = value.toString().toLowerCase().replace(/,/g, '');
  
  if (cleanValue.includes('k')) {
    return parseFloat(cleanValue.replace('k', '')) * 1_000;
  }
  if (cleanValue.includes('m')) {
    return parseFloat(cleanValue.replace('m', '')) * 1_000_000;
  }
  if (cleanValue.includes('b')) {
    return parseFloat(cleanValue.replace('b', '')) * 1_000_000_000;
  }
  
  return parseFloat(cleanValue) || 0;
}

// Format numbers with commas and shorthand
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}b`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}m`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k`;
  }
  return num.toLocaleString();
}

// Calculate profit after taxes
export function calculateProfit(
  soldPrice: number,
  costBasis: number
): { taxPercent: number; taxAmount: number; netProfit: number } {
  const { taxPercent, taxAmount } = calculateTax(soldPrice);
  const taxedSoldPrice = soldPrice - taxAmount;
  const netProfit = taxedSoldPrice - costBasis;
  
  return { taxPercent, taxAmount, netProfit };
}