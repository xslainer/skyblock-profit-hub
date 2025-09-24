import { useState, useEffect } from 'react';
import { Trade, TradeCategory } from '@/types/trade';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Save } from 'lucide-react';
import { formatNumber } from '@/utils/calculations';

interface FormData {
  itemName: string;
  category: TradeCategory | '';
  lowestBin: string;
  craftCost: string;
  pricePaid: string;
  ahAverageValue: string;
  soldPrice: string;
  taxPercent: string;
  costBasis: 'lowestBin' | 'craftCost' | 'pricePaid';
  lowballBasis: 'lowestBin' | 'craftCost';
}

interface EditTradeDialogProps {
  trade: Trade | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedTrade: Trade) => Promise<boolean>;
}

export function EditTradeDialog({ trade, open, onClose, onSave }: EditTradeDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    itemName: '',
    category: '',
    lowestBin: '',
    craftCost: '',
    pricePaid: '',
    ahAverageValue: '',
    soldPrice: '',
    taxPercent: '',
    costBasis: 'lowestBin',
    lowballBasis: 'lowestBin',
  });
  const [isSaving, setIsSaving] = useState(false);

  const categories: TradeCategory[] = [
    'Armors', 'Swords', 'Bows', 'Skins', 'Dyes', 'Miscellaneous', 'Accessories'
  ];

  useEffect(() => {
    if (trade) {
      setFormData({
        itemName: trade.itemName,
        category: trade.category,
        lowestBin: trade.lowestBin.toString(),
        craftCost: trade.craftCost.toString(),
        pricePaid: trade.pricePaid.toString(),
        ahAverageValue: trade.ahAverageValue.toString(),
        soldPrice: trade.soldPrice.toString(),
        taxPercent: trade.taxPercent.toString(),
        costBasis: trade.costBasis,
        lowballBasis: trade.lowballBasis,
      });
    }
  }, [trade]);

  const handleSave = async () => {
    if (!trade || !formData.itemName || !formData.category) return;

    setIsSaving(true);
    
    // Calculate derived values
    const lowestBin = Number(formData.lowestBin) || 0;
    const craftCost = Number(formData.craftCost) || 0;
    const pricePaid = Number(formData.pricePaid) || 0;
    const ahAverageValue = Number(formData.ahAverageValue) || 0;
    const soldPrice = Number(formData.soldPrice) || 0;
    const taxPercent = Number(formData.taxPercent) || 1;

    // Calculate tax amount and net profit
    const taxAmount = (soldPrice * taxPercent) / 100;
    const netProfit = soldPrice - pricePaid - taxAmount;

    // Calculate lowball percentage
    let lowballPercent = 0;
    if (formData.lowballBasis === 'lowestBin' && lowestBin > 0) {
      lowballPercent = Math.round(100 - (pricePaid / lowestBin) * 100);
    } else if (formData.lowballBasis === 'craftCost' && craftCost > 0) {
      lowballPercent = Math.round(100 - (pricePaid / craftCost) * 100);
    }

    const updatedTrade: Trade = {
      ...trade,
      itemName: formData.itemName,
      category: formData.category as TradeCategory,
      lowestBin,
      craftCost,
      pricePaid,
      ahAverageValue,
      soldPrice,
      taxPercent,
      taxAmount,
      netProfit,
      lowballPercent,
      costBasis: formData.costBasis as 'lowestBin' | 'craftCost' | 'pricePaid',
      lowballBasis: formData.lowballBasis as 'lowestBin' | 'craftCost',
    };

    const success = await onSave(updatedTrade);
    if (success) {
      onClose();
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    if (trade) {
      setFormData({
        itemName: trade.itemName,
        category: trade.category,
        lowestBin: trade.lowestBin.toString(),
        craftCost: trade.craftCost.toString(),
        pricePaid: trade.pricePaid.toString(),
        ahAverageValue: trade.ahAverageValue.toString(),
        soldPrice: trade.soldPrice.toString(),
        taxPercent: trade.taxPercent.toString(),
        costBasis: trade.costBasis,
        lowballBasis: trade.lowballBasis,
      });
    }
    onClose();
  };

  if (!trade) return null;

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                value={formData.itemName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                placeholder="Enter item name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select 
                value={formData.category || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as TradeCategory }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lowestBin">Lowest BIN</Label>
              <Input
                id="lowestBin"
                type="number"
                value={formData.lowestBin || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, lowestBin: e.target.value }))}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="craftCost">Raw Craft Cost</Label>
              <Input
                id="craftCost"
                type="number"
                value={formData.craftCost || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, craftCost: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePaid">Price Paid *</Label>
              <Input
                id="pricePaid"
                type="number"
                value={formData.pricePaid || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePaid: e.target.value }))}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ahAverageValue">AH Average Value</Label>
              <Input
                id="ahAverageValue"
                type="number"
                value={formData.ahAverageValue || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, ahAverageValue: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="soldPrice">Sold Price</Label>
              <Input
                id="soldPrice"
                type="number"
                value={formData.soldPrice || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, soldPrice: e.target.value }))}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taxPercent">Tax Percent (%)</Label>
              <Input
                id="taxPercent"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.taxPercent || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, taxPercent: e.target.value }))}
                placeholder="1.0"
              />
            </div>
          </div>

          {/* Cost and Lowball Basis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Cost Basis for Profit Calculation</Label>
              <RadioGroup 
                value={formData.costBasis || 'lowestBin'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, costBasis: value as 'lowestBin' | 'craftCost' | 'pricePaid' }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lowestBin" id="cost-lowestBin" />
                  <Label htmlFor="cost-lowestBin">Lowest BIN</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="craftCost" id="cost-craftCost" />
                  <Label htmlFor="cost-craftCost">Raw Craft Cost</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pricePaid" id="cost-pricePaid" />
                  <Label htmlFor="cost-pricePaid">Price Paid</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Lowball % Calculation Basis</Label>
              <RadioGroup 
                value={formData.lowballBasis || 'lowestBin'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, lowballBasis: value as 'lowestBin' | 'craftCost' }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lowestBin" id="lowball-lowestBin" />
                  <Label htmlFor="lowball-lowestBin">Lowest BIN</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="craftCost" id="lowball-craftCost" />
                  <Label htmlFor="lowball-craftCost">Raw Craft Cost</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Preview Calculations */}
          {formData.pricePaid && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Preview Calculations</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tax Amount:</span>
                  <span className="ml-2 font-medium">
                    {formatNumber(((Number(formData.soldPrice) || 0) * (Number(formData.taxPercent) || 1)) / 100)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Net Profit:</span>
                  <span className="ml-2 font-medium">
                    {formatNumber((Number(formData.soldPrice) || 0) - (Number(formData.pricePaid) || 0) - (((Number(formData.soldPrice) || 0) * (Number(formData.taxPercent) || 1)) / 100))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !formData.itemName || !formData.category}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}