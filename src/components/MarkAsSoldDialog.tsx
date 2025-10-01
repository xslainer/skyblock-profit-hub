import { useState } from 'react';
import { InventoryItem } from '@/types/trade';
import { formatNumber, parseShorthand, calculateProfit } from '@/utils/calculations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PriceInput } from '@/components/ui/price-input';
import { Card } from '@/components/ui/card';
import { Calculator, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkAsSoldDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (item: InventoryItem, soldPrice: number, dateSold: Date) => void;
}

export function MarkAsSoldDialog({ item, open, onOpenChange, onConfirm }: MarkAsSoldDialogProps) {
  const [soldPrice, setSoldPrice] = useState('');
  const [dateSold, setDateSold] = useState(new Date().toISOString().slice(0, 16));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const soldPriceNum = parseShorthand(soldPrice);
  const calculations = soldPriceNum > 0 && item 
    ? calculateProfit(soldPriceNum, item.pricePaid)
    : { taxPercent: 0, taxAmount: 0, netProfit: 0 };

  const handleSubmit = async () => {
    if (!item || soldPriceNum <= 0) return;
    
    setIsSubmitting(true);
    await onConfirm(item, soldPriceNum, new Date(dateSold));
    setIsSubmitting(false);
    
    // Reset form
    setSoldPrice('');
    setDateSold(new Date().toISOString().slice(0, 16));
    onOpenChange(false);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Sale</DialogTitle>
          <DialogDescription>
            Record the final sale details for this item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Info */}
          <Card className="p-4 bg-muted/50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Item</p>
                <p className="font-semibold">{item.itemName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-semibold">{item.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date Purchased</p>
                <p className="font-medium">{item.datePurchased.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Price Paid</p>
                <p className="font-medium">{formatNumber(item.pricePaid)}</p>
              </div>
            </div>
          </Card>

          {/* Sale Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="soldPrice">Sale Price</Label>
              <PriceInput
                id="soldPrice"
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
                placeholder="e.g. 120m, 1.8b"
                className="transition-all duration-200 focus:shadow-glow"
              />
              <p className="text-xs text-muted-foreground">
                Enter the price you sold this item for
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateSold">Date Sold</Label>
              <input
                id="dateSold"
                type="datetime-local"
                value={dateSold}
                onChange={(e) => setDateSold(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Real-time Calculations */}
          {soldPriceNum > 0 && (
            <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold">Profit Calculation</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Sale Price</p>
                  <p className="font-medium">{formatNumber(soldPriceNum)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tax ({calculations.taxPercent}%)</p>
                  <p className="font-medium">-{formatNumber(calculations.taxAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cost Basis</p>
                  <p className="font-medium">{formatNumber(item.pricePaid)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Net Profit</p>
                  <p className={cn(
                    "font-bold text-lg",
                    calculations.netProfit >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {calculations.netProfit >= 0 ? '+' : ''}{formatNumber(calculations.netProfit)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={soldPriceNum <= 0 || isSubmitting}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Completing...' : 'Complete Sale'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
