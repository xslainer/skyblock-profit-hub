import { useState } from 'react';
import { parseShorthand, formatNumber, calculateTax } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, TrendingUp, Clock, DollarSign } from 'lucide-react';

export function OpportunityCalculator() {
  const [inputs, setInputs] = useState({
    currentPrice: '',
    targetBuyPrice: '',
    targetSellPrice: '',
    estimatedDays: ''
  });

  const [results, setResults] = useState<{
    potentialProfit: number;
    potentialROI: number;
    profitVelocity: number;
    afterTaxProfit: number;
  } | null>(null);

  const calculate = () => {
    const currentPrice = parseShorthand(inputs.currentPrice);
    const targetBuyPrice = parseShorthand(inputs.targetBuyPrice);
    const targetSellPrice = parseShorthand(inputs.targetSellPrice);
    const estimatedDays = parseInt(inputs.estimatedDays) || 1;

    if (!currentPrice || !targetBuyPrice || !targetSellPrice) return;

    const { taxAmount } = calculateTax(targetSellPrice);
    const afterTaxSellPrice = targetSellPrice - taxAmount;
    const potentialProfit = afterTaxSellPrice - targetBuyPrice;
    const afterTaxProfit = potentialProfit;
    const potentialROI = (potentialProfit / targetBuyPrice) * 100;
    const profitVelocity = potentialProfit / estimatedDays;

    setResults({
      potentialProfit,
      potentialROI,
      profitVelocity,
      afterTaxProfit
    });
  };

  const reset = () => {
    setInputs({
      currentPrice: '',
      targetBuyPrice: '',
      targetSellPrice: '',
      estimatedDays: ''
    });
    setResults(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Opportunity Score Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Evaluate the potential of a flip before you invest
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="current-price">Current Market Price</Label>
            <Input
              id="current-price"
              value={inputs.currentPrice}
              onChange={(e) => setInputs(prev => ({ ...prev, currentPrice: e.target.value }))}
              placeholder="e.g., 100m"
            />
          </div>
          
          <div>
            <Label htmlFor="target-buy">Target Buy Price</Label>
            <Input
              id="target-buy"
              value={inputs.targetBuyPrice}
              onChange={(e) => setInputs(prev => ({ ...prev, targetBuyPrice: e.target.value }))}
              placeholder="e.g., 80m"
            />
          </div>
          
          <div>
            <Label htmlFor="target-sell">Target Sell Price</Label>
            <Input
              id="target-sell"
              value={inputs.targetSellPrice}
              onChange={(e) => setInputs(prev => ({ ...prev, targetSellPrice: e.target.value }))}
              placeholder="e.g., 110m"
            />
          </div>
          
          <div>
            <Label htmlFor="estimated-days">Estimated Days to Sell</Label>
            <Input
              id="estimated-days"
              type="number"
              value={inputs.estimatedDays}
              onChange={(e) => setInputs(prev => ({ ...prev, estimatedDays: e.target.value }))}
              placeholder="e.g., 3"
              min="1"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={calculate} className="flex-1">
            Calculate Opportunity
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>

        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <h4 className="font-semibold">Potential Profit</h4>
              </div>
              <p className={`text-2xl font-bold ${results.potentialProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {results.potentialProfit >= 0 ? '+' : ''}{formatNumber(results.potentialProfit)}
              </p>
              <p className="text-xs text-muted-foreground">After AH tax</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <h4 className="font-semibold">Potential ROI</h4>
              </div>
              <p className={`text-2xl font-bold ${results.potentialROI >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {results.potentialROI >= 0 ? '+' : ''}{results.potentialROI.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Return on investment</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <h4 className="font-semibold">Profit Velocity</h4>
              </div>
              <p className="text-2xl font-bold text-purple-500">
                {formatNumber(results.profitVelocity)}
              </p>
              <p className="text-xs text-muted-foreground">Profit per day</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-orange-500" />
                <h4 className="font-semibold">Opportunity Score</h4>
              </div>
              <p className="text-2xl font-bold text-orange-500">
                {Math.round(results.profitVelocity / 1000000 * 10) / 10}
              </p>
              <p className="text-xs text-muted-foreground">Higher is better</p>
            </div>
          </div>
        )}

        {results && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Analysis Summary</h4>
            <div className="space-y-1 text-sm">
              {results.potentialROI > 20 && (
                <p className="text-green-600">✓ Excellent ROI potential ({results.potentialROI.toFixed(1)}%)</p>
              )}
              {results.potentialROI > 10 && results.potentialROI <= 20 && (
                <p className="text-yellow-600">⚠ Good ROI potential ({results.potentialROI.toFixed(1)}%)</p>
              )}
              {results.potentialROI <= 10 && results.potentialROI > 0 && (
                <p className="text-orange-600">⚠ Low ROI potential ({results.potentialROI.toFixed(1)}%)</p>
              )}
              {results.potentialROI <= 0 && (
                <p className="text-red-600">✗ Negative ROI - avoid this trade</p>
              )}
              
              {results.profitVelocity > 5000000 && (
                <p className="text-green-600">✓ High profit velocity - fast returns expected</p>
              )}
              {results.profitVelocity <= 1000000 && (
                <p className="text-orange-600">⚠ Low profit velocity - slow returns expected</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}