import { useState } from 'react';
import { Trade, TradeCategory } from '@/types/trade';
import { parseShorthand, calculateProfit, formatNumber } from '@/utils/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddTradeProps {
  onAddTrade: (trade: Trade) => void;
}

export function AddTrade({ onAddTrade }: AddTradeProps) {
  const categories: TradeCategory[] = [
    'Armors', 'Swords', 'Mage weapons', 'Bows', 'Skins', 'Dyes', 'Miscellaneous', 'Accessories'
  ];

  const [formData, setFormData] = useState({
    itemName: '',
    category: '' as TradeCategory | '',
    lowestBin: '',
    craftCost: '',
    pricePaid: '',
    ahAverageValue: '',
    soldPrice: '',
    costBasis: 'pricePaid' as 'lowestBin' | 'craftCost' | 'pricePaid',
    lowballBasis: 'lowestBin' as 'lowestBin' | 'craftCost',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time calculations
  const lowestBinNum = parseShorthand(formData.lowestBin);
  const craftCostNum = parseShorthand(formData.craftCost);
  const pricePaidNum = parseShorthand(formData.pricePaid);
  const ahAverageValueNum = parseShorthand(formData.ahAverageValue);
  const soldPriceNum = parseShorthand(formData.soldPrice);
  
  // Calculate lowball % automatically based on basis selection
  const getLowballBasisValue = () => {
    return formData.lowballBasis === 'lowestBin' ? lowestBinNum : craftCostNum;
  };
  
  const lowballBasisValue = getLowballBasisValue();
  const lowballPercentNum = (pricePaidNum > 0 && lowballBasisValue > 0) 
    ? 100 - ((pricePaidNum / lowballBasisValue) * 100)
    : 0;
  
  const getCostBasis = () => {
    switch (formData.costBasis) {
      case 'lowestBin': return lowestBinNum;
      case 'craftCost': return craftCostNum;
      case 'pricePaid': return pricePaidNum;
      default: return pricePaidNum;
    }
  };
  
  const costBasis = getCostBasis();
  const calculations = soldPriceNum > 0 && costBasis > 0 
    ? calculateProfit(soldPriceNum, costBasis)
    : { taxPercent: 0, taxAmount: 0, netProfit: 0 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const newTrade: Trade = {
      id: crypto.randomUUID(),
      itemName: formData.itemName.trim(),
      category: formData.category as TradeCategory,
      lowestBin: lowestBinNum,
      craftCost: craftCostNum,
      pricePaid: pricePaidNum,
      ahAverageValue: ahAverageValueNum,
      lowballPercent: lowballPercentNum,
      soldPrice: soldPriceNum,
      taxPercent: calculations.taxPercent,
      taxAmount: calculations.taxAmount,
      netProfit: calculations.netProfit,
      dateTime: new Date(),
      costBasis: formData.costBasis,
      lowballBasis: formData.lowballBasis,
    };

    onAddTrade(newTrade);
    
    // Reset form
    setFormData({
      itemName: '',
      category: '',
      lowestBin: '',
      craftCost: '',
      pricePaid: '',
      ahAverageValue: '',
      soldPrice: '',
      costBasis: 'pricePaid',
      lowballBasis: 'lowestBin',
    });

    setIsSubmitting(false);
  };

  const isValid = formData.itemName.trim() && 
    formData.category &&
    formData.lowestBin && 
    formData.craftCost && 
    formData.pricePaid &&
    formData.soldPrice &&
    soldPriceNum > 0 &&
    costBasis > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Add New Trade</h2>
        <p className="text-muted-foreground">
          Record your Hypixel Skyblock lowballing transactions
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Name and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                placeholder="e.g. Hyperion, Necron's Helmet"
                className="transition-all duration-200 focus:shadow-glow"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as TradeCategory }))}>
                <SelectTrigger className="transition-all duration-200 focus:shadow-glow">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-50">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* Price Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lowestBin">Lowest BIN Price</Label>
              <Input
                id="lowestBin"
                value={formData.lowestBin}
                onChange={(e) => setFormData(prev => ({ ...prev, lowestBin: e.target.value }))}
                placeholder="e.g. 100m, 1.5b"
                className="transition-all duration-200 focus:shadow-glow"
              />
              <p className="text-xs text-muted-foreground">
                Current market price
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="craftCost">Raw Craft Cost</Label>
              <Input
                id="craftCost"
                value={formData.craftCost}
                onChange={(e) => setFormData(prev => ({ ...prev, craftCost: e.target.value }))}
                placeholder="e.g. 95m, 1.2b"
                className="transition-all duration-200 focus:shadow-glow"
              />
              <p className="text-xs text-muted-foreground">
                Cost to craft the item
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePaid">Price Paid</Label>
              <Input
                id="pricePaid"
                value={formData.pricePaid}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePaid: e.target.value }))}
                placeholder="e.g. 85m, 1.1b"
                className="transition-all duration-200 focus:shadow-glow"
              />
              <p className="text-xs text-muted-foreground">
                What you actually paid
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ahAverageValue">AH Average Value</Label>
              <Input
                id="ahAverageValue"
                value={formData.ahAverageValue}
                onChange={(e) => setFormData(prev => ({ ...prev, ahAverageValue: e.target.value }))}
                placeholder="e.g. 98m, 1.4b"
                className="transition-all duration-200 focus:shadow-glow"
              />
              <p className="text-xs text-muted-foreground">
                Average auction house price
              </p>
            </div>
          </div>

          {/* Lowball Basis Selection */}
          <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
            <div>
              <Label className="text-sm font-medium">
                Lowball Calculation Basis
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Choose which price to use for lowball % calculation
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'lowestBin', label: 'Lowest BIN', desc: 'Use market price' },
                { value: 'craftCost', label: 'Raw Craft Cost', desc: 'Use material cost' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, lowballBasis: option.value as any }))}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all duration-200",
                    formData.lowballBasis === option.value
                      ? "bg-primary text-primary-foreground border-primary shadow-glow"
                      : "bg-background hover:bg-muted border-border"
                  )}
                >
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs opacity-75">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-calculated Lowball % and Sold Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lowball % (Auto-calculated)</Label>
              <div className="p-3 rounded-lg bg-muted/30 border border-dashed">
                <div className="text-lg font-semibold">
                  {lowballPercentNum > 0 ? `${lowballPercentNum.toFixed(2)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  100 - (Price Paid ÷ {formData.lowballBasis === 'lowestBin' ? 'Lowest BIN' : 'Raw Craft Cost'}) × 100
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="soldPrice">Price Sold For</Label>
              <Input
                id="soldPrice"
                value={formData.soldPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, soldPrice: e.target.value }))}
                placeholder="e.g. 120m, 1.8b"
                className="transition-all duration-200 focus:shadow-glow"
              />
            </div>
          </div>

          {/* Cost Basis Selection */}
          <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
            <div>
              <Label className="text-sm font-medium">
                Cost Basis for Profit Calculation
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Choose which cost to use for calculating profit
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'pricePaid', label: 'Price Paid', desc: 'What you paid' },
                { value: 'lowestBin', label: 'Lowest BIN', desc: 'Market value' },
                { value: 'craftCost', label: 'Craft Cost', desc: 'Material cost' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, costBasis: option.value as any }))}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all duration-200",
                    formData.costBasis === option.value
                      ? "bg-primary text-primary-foreground border-primary shadow-glow"
                      : "bg-background hover:bg-muted border-border"
                  )}
                >
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs opacity-75">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Calculations */}
          {soldPriceNum > 0 && costBasis > 0 && (
            <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold">Live Calculations</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tax Rate</p>
                  <p className="font-medium">{calculations.taxPercent}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tax Amount</p>
                  <p className="font-medium">{formatNumber(calculations.taxAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cost Basis</p>
                  <p className="font-medium">{formatNumber(costBasis)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Net Profit</p>
                  <p className={cn(
                    "font-bold",
                    calculations.netProfit >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {calculations.netProfit >= 0 ? '+' : ''}{formatNumber(calculations.netProfit)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full h-12 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-all duration-200"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Adding Trade...' : 'Add Trade'}
          </Button>
        </form>
      </Card>
    </div>
  );
}