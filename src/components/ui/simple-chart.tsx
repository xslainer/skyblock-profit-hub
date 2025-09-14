// Simple chart components for the lowballing tracker
import React from 'react';
import { cn } from '@/lib/utils';

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: Record<string, any>;
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full h-full", className)} {...props}>
        {children}
      </div>
    );
  }
);

ChartContainer.displayName = "ChartContainer";

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  className?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  className
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className={cn(
      "rounded-lg border bg-background p-2 shadow-md",
      className
    )}>
      {label && (
        <p className="text-sm font-medium mb-1">{label}</p>
      )}
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }} 
          />
          <span>{item.name}: {item.value}</span>
        </div>
      ))}
    </div>
  );
};