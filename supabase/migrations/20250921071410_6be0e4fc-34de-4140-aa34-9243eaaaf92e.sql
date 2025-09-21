-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing tables and start fresh
DROP TABLE IF EXISTS public.trades CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with proper constraints
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  username text,
  display_name text,
  ingame_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Add reasonable constraints
  CONSTRAINT username_length CHECK (username IS NULL OR (length(username) >= 2 AND length(username) <= 50)),
  CONSTRAINT display_name_length CHECK (display_name IS NULL OR (length(display_name) >= 1 AND length(display_name) <= 100)),
  CONSTRAINT ingame_name_length CHECK (ingame_name IS NULL OR (length(ingame_name) >= 1 AND length(ingame_name) <= 50))
);

-- Create trades table with numeric types for precise calculations
CREATE TABLE public.trades (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  item_name text NOT NULL,
  category text NOT NULL,
  
  -- Use numeric for monetary values (stores as whole numbers)
  lowest_bin numeric(15,0) NOT NULL,
  craft_cost numeric(15,0) NOT NULL,
  price_paid numeric(15,0) NOT NULL,
  ah_average_value numeric(15,0) NOT NULL,
  sold_price numeric(15,0) NOT NULL,
  
  -- Percentages as numeric values (allows decimals)
  lowball_percent numeric(8,4) NOT NULL,
  tax_percent numeric(5,2) NOT NULL,
  
  -- Monetary amounts
  tax_amount numeric(15,0) NOT NULL,
  net_profit numeric(15,0) NOT NULL,
  
  -- Trade metadata
  cost_basis text NOT NULL,
  lowball_basis text NOT NULL,
  date_time timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Basic constraints (no percentage limits for flexibility)
  CONSTRAINT item_name_not_empty CHECK (length(trim(item_name)) > 0),
  CONSTRAINT positive_monetary_values CHECK (
    lowest_bin >= 0 AND 
    craft_cost >= 0 AND 
    price_paid >= 0 AND 
    ah_average_value >= 0 AND 
    sold_price >= 0 AND
    tax_amount >= 0
  ),
  CONSTRAINT valid_category CHECK (category IN (
    'Armors', 'Swords', 'Mage weapons', 'Bows', 'Skins', 'Dyes', 'Miscellaneous', 'Accessories'
  )),
  CONSTRAINT valid_cost_basis CHECK (cost_basis IN ('lowestBin', 'craftCost', 'pricePaid')),
  CONSTRAINT valid_lowball_basis CHECK (lowball_basis IN ('lowestBin', 'craftCost'))
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
ON public.profiles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own trades" 
ON public.trades FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trades" 
ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" 
ON public.trades FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades" 
ON public.trades FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_user_date ON public.trades(user_id, date_time DESC);

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recreate the user profile trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();