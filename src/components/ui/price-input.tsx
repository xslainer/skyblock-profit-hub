import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PriceInputProps extends React.ComponentProps<"input"> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const formatPriceDisplay = (value: string): string | null => {
  // Remove any non-numeric characters for parsing
  const cleanValue = value.replace(/[^0-9.]/g, '');
  const numValue = parseFloat(cleanValue);
  
  if (isNaN(numValue) || numValue < 1000) {
    return null;
  }
  
  // Format with commas
  const withCommas = numValue.toLocaleString();
  
  // Format shorthand
  let shorthand: string;
  if (numValue >= 1_000_000_000) {
    const billions = numValue / 1_000_000_000;
    shorthand = billions % 1 === 0 ? `${billions}B` : `${billions.toFixed(billions < 10 ? 2 : 1)}B`;
  } else if (numValue >= 1_000_000) {
    const millions = numValue / 1_000_000;
    shorthand = millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(millions < 10 ? 2 : 1)}M`;
  } else {
    const thousands = numValue / 1_000;
    shorthand = `${Math.floor(thousands)}K`;
  }
  
  return `${withCommas} = ${shorthand}`;
};

const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string | null>(null);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setDisplayValue(formatPriceDisplay(newValue));
      onChange(e);
    };
    
    React.useEffect(() => {
      setDisplayValue(formatPriceDisplay(value));
    }, [value]);

    return (
      <div className="relative">
        <Input
          ref={ref}
          className={cn(className)}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {displayValue && (
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {displayValue}
          </p>
        )}
      </div>
    );
  }
);

PriceInput.displayName = "PriceInput";

export { PriceInput };