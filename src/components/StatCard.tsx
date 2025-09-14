import { formatNumber } from '@/utils/calculations';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  variant?: 'default' | 'profit' | 'loss' | 'gold';
  className?: string;
}

export function StatCard({ title, value, subtitle, variant = 'default', className }: StatCardProps) {
  const isProfit = value > 0;
  const isLoss = value < 0;
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'profit':
        return 'bg-gradient-profit text-white border-success/20';
      case 'loss':
        return 'bg-gradient-loss text-white border-destructive/20';
      case 'gold':
        return 'bg-gradient-gold text-accent-foreground border-accent/20';
      default:
        return 'bg-card text-card-foreground border-border';
    }
  };

  const getValueColor = () => {
    if (variant !== 'default') return '';
    if (isProfit) return 'text-success';
    if (isLoss) return 'text-destructive';
    return 'text-foreground';
  };

  return (
    <div className={cn(
      "rounded-xl border p-6 shadow-card transition-all duration-200 hover:shadow-hover animate-fade-in",
      getVariantStyles(),
      className
    )}>
      <div className="space-y-2">
        <p className={cn(
          "text-sm font-medium",
          variant === 'default' ? 'text-muted-foreground' : 'opacity-90'
        )}>
          {title}
        </p>
        <div className="space-y-1">
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            getValueColor()
          )}>
            {value >= 0 ? '+' : ''}{formatNumber(value)}
          </p>
          {subtitle && (
            <p className={cn(
              "text-xs",
              variant === 'default' ? 'text-muted-foreground' : 'opacity-75'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}