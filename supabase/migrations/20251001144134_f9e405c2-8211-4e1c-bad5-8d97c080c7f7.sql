-- Step 2: Update existing records to use new enum values
UPDATE trades SET status = 'completed' WHERE status = 'Sold';
UPDATE trades SET status = 'inventory' WHERE status = 'Not Sold';