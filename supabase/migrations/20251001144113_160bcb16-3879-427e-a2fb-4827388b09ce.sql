-- Step 1: Add new enum values (this will auto-commit)
ALTER TYPE trade_status ADD VALUE IF NOT EXISTS 'inventory';
ALTER TYPE trade_status ADD VALUE IF NOT EXISTS 'completed';