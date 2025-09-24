import { useState, useMemo } from 'react';
import { Trade } from '@/types/trade';
import { formatNumber } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Trash2, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

interface GameEvent {
  id: string;
  name: string;
  type: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

interface EventImpactAnalysisProps {
  trades: Trade[];
}

export function EventImpactAnalysis({ trades }: EventImpactAnalysisProps) {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: '',
    startDate: '',
    endDate: ''
  });
  const { toast } = useToast();

  const eventTypes = [
    { value: 'mayor', label: 'Mayor Event', color: '#3b82f6' },
    { value: 'festival', label: 'Festival', color: '#f59e0b' },
    { value: 'dungeon', label: 'Dungeon Event', color: '#8b5cf6' },
    { value: 'mining', label: 'Mining Event', color: '#ef4444' },
    { value: 'fishing', label: 'Fishing Event', color: '#06b6d4' },
    { value: 'custom', label: 'Custom Event', color: '#10b981' }
  ];

  const addEvent = () => {
    if (!newEvent.name || !newEvent.type || !newEvent.startDate || !newEvent.endDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields to create an event.",
        variant: "destructive",
      });
      return;
    }

    const eventTypeConfig = eventTypes.find(t => t.value === newEvent.type);
    const event: GameEvent = {
      id: crypto.randomUUID(),
      name: newEvent.name,
      type: newEvent.type,
      startDate: parseISO(newEvent.startDate),
      endDate: parseISO(newEvent.endDate),
      color: eventTypeConfig?.color || '#10b981'
    };

    setEvents(prev => [...prev, event]);
    setNewEvent({ name: '', type: '', startDate: '', endDate: '' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Event added",
      description: `Event "${event.name}" has been saved.`,
    });
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    if (selectedEvent === id) {
      setSelectedEvent('');
    }
    toast({
      title: "Event deleted",
      description: "Event has been removed.",
    });
  };

  const eventAnalysis = useMemo(() => {
    if (!selectedEvent) return null;

    const event = events.find(e => e.id === selectedEvent);
    if (!event) return null;

    const eventTrades = trades.filter(trade => 
      isWithinInterval(trade.dateTime, {
        start: startOfDay(event.startDate),
        end: endOfDay(event.endDate)
      })
    );

    const totalProfit = eventTrades.reduce((sum, trade) => sum + trade.netProfit, 0);
    const avgProfit = eventTrades.length > 0 ? totalProfit / eventTrades.length : 0;
    const avgROI = eventTrades.length > 0 ? 
      eventTrades.reduce((sum, trade) => {
        const costBasisValue = trade.costBasis === 'lowestBin' ? trade.lowestBin : 
                             trade.costBasis === 'craftCost' ? trade.craftCost : trade.pricePaid;
        return sum + (trade.netProfit / costBasisValue * 100);
      }, 0) / eventTrades.length : 0;

    const profitableTrades = eventTrades.filter(t => t.netProfit > 0).length;
    const profitRate = eventTrades.length > 0 ? (profitableTrades / eventTrades.length) * 100 : 0;

    return {
      event,
      trades: eventTrades,
      totalProfit,
      avgProfit,
      avgROI,
      profitRate,
      tradeCount: eventTrades.length
    };
  }, [selectedEvent, events, trades]);

  const overallStats = useMemo(() => {
    const totalProfit = trades.reduce((sum, trade) => sum + trade.netProfit, 0);
    const avgProfit = trades.length > 0 ? totalProfit / trades.length : 0;
    const avgROI = trades.length > 0 ? 
      trades.reduce((sum, trade) => {
        const costBasisValue = trade.costBasis === 'lowestBin' ? trade.lowestBin : 
                             trade.costBasis === 'craftCost' ? trade.craftCost : trade.pricePaid;
        return sum + (trade.netProfit / costBasisValue * 100);
      }, 0) / trades.length : 0;

    return { totalProfit, avgProfit, avgROI };
  }, [trades]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Event Impact Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Track how in-game events affect your trading performance
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Game Event</DialogTitle>
                <DialogDescription>
                  Mark significant in-game events to analyze their impact on your trading
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-name">Event Name</Label>
                  <Input
                    id="event-name"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Diana Mayoralty"
                  />
                </div>
                
                <div>
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select value={newEvent.type} onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></div>
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addEvent}>
                  Add Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Event List */}
        <div className="space-y-2">
          <Label>Tracked Events</Label>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No events tracked yet. Add events to analyze their impact on your trading.
            </p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }}></div>
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(event.startDate, 'MMM d')} - {format(event.endDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {eventTypes.find(t => t.value === event.type)?.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedEvent === event.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedEvent(selectedEvent === event.id ? '' : event.id)}
                    >
                      {selectedEvent === event.id ? 'Selected' : 'Analyze'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {eventAnalysis && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Analysis: {eventAnalysis.event.name}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Total Profit</h4>
                <p className={`text-xl font-bold ${eventAnalysis.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {eventAnalysis.totalProfit >= 0 ? '+' : ''}{formatNumber(eventAnalysis.totalProfit)}
                </p>
                <p className="text-xs text-muted-foreground">
                  vs avg: {formatNumber(overallStats.totalProfit)}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Avg Profit/Trade</h4>
                <p className={`text-xl font-bold ${eventAnalysis.avgProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {eventAnalysis.avgProfit >= 0 ? '+' : ''}{formatNumber(eventAnalysis.avgProfit)}
                </p>
                <p className="text-xs text-muted-foreground">
                  vs avg: {formatNumber(overallStats.avgProfit)}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Avg ROI</h4>
                <p className={`text-xl font-bold ${eventAnalysis.avgROI >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {eventAnalysis.avgROI >= 0 ? '+' : ''}{eventAnalysis.avgROI.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  vs avg: {overallStats.avgROI.toFixed(1)}%
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Success Rate</h4>
                <p className="text-xl font-bold text-blue-500">
                  {eventAnalysis.profitRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {eventAnalysis.tradeCount} total trades
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Event Performance Summary</h4>
              <div className="space-y-1 text-sm">
                {eventAnalysis.avgProfit > overallStats.avgProfit && (
                  <p className="text-green-600">✓ Above average profit per trade during this event</p>
                )}
                {eventAnalysis.avgROI > overallStats.avgROI && (
                  <p className="text-green-600">✓ Above average ROI during this event</p>
                )}
                {eventAnalysis.profitRate > 60 && (
                  <p className="text-green-600">✓ High success rate during this event</p>
                )}
                {eventAnalysis.avgProfit <= overallStats.avgProfit && (
                  <p className="text-orange-600">⚠ Below average profit per trade during this event</p>
                )}
                {eventAnalysis.tradeCount === 0 && (
                  <p className="text-gray-600">No trades recorded during this event period</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}