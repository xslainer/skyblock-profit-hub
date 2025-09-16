-- Create trades table for storing user lowballing data
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Armors', 'Swords', 'Mage weapons', 'Bows', 'Skins', 'Dyes', 'Miscellaneous', 'Accessories')),
  lowest_bin BIGINT NOT NULL,
  craft_cost BIGINT NOT NULL,
  price_paid BIGINT NOT NULL,
  ah_average_value BIGINT NOT NULL,
  lowball_percent DECIMAL(5,2) NOT NULL,
  sold_price BIGINT NOT NULL,
  tax_percent DECIMAL(4,2) NOT NULL,
  tax_amount BIGINT NOT NULL,
  net_profit BIGINT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cost_basis TEXT NOT NULL CHECK (cost_basis IN ('lowestBin', 'craftCost', 'pricePaid')),
  lowball_basis TEXT NOT NULL CHECK (lowball_basis IN ('lowestBin', 'craftCost')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies so users can only access their own trades
CREATE POLICY "Users can view their own trades" 
ON public.trades 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trades" 
ON public.trades 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" 
ON public.trades 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades" 
ON public.trades 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trades_updated_at
BEFORE UPDATE ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on user queries
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_date_time ON public.trades(date_time DESC);