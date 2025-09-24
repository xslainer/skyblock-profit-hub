import { BulkAddTrades } from '@/components/BulkAddTrades';
import { useTrades } from '@/hooks/useTrades';

export function BulkEntry() {
  const { addTrades } = useTrades();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Bulk Trade Entry</h1>
        <p className="text-muted-foreground">
          Quickly add multiple trades using a spreadsheet-like interface
        </p>
      </div>
      
      <BulkAddTrades onTradesAdded={addTrades} />
    </div>
  );
}