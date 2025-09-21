-- Fix public profile exposure - restrict to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Add input validation constraints for profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT username_length_check CHECK (LENGTH(username) >= 2 AND LENGTH(username) <= 50),
ADD CONSTRAINT display_name_length_check CHECK (LENGTH(display_name) >= 1 AND LENGTH(display_name) <= 100),
ADD CONSTRAINT ingame_name_length_check CHECK (LENGTH(ingame_name) >= 1 AND LENGTH(ingame_name) <= 50);

-- Add input validation constraints for trades
ALTER TABLE public.trades 
ADD CONSTRAINT item_name_length_check CHECK (LENGTH(item_name) >= 1 AND LENGTH(item_name) <= 200),
ADD CONSTRAINT positive_prices_check CHECK (
  lowest_bin >= 0 AND 
  craft_cost >= 0 AND 
  price_paid >= 0 AND 
  ah_average_value >= 0 AND 
  sold_price >= 0
),
ADD CONSTRAINT valid_percentages_check CHECK (
  lowball_percent >= 0 AND lowball_percent <= 100 AND
  tax_percent >= 0 AND tax_percent <= 100
);

-- Create index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_trades_user_date ON public.trades(user_id, date_time DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);