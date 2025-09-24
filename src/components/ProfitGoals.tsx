import { useState } from 'react';
import { UserGoals, ProfitMetrics } from '@/types/trade';
import { formatNumber } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfitGoalsProps {
  metrics: ProfitMetrics;
}

export function ProfitGoals({ metrics }: ProfitGoalsProps) {
  const [goals, setGoals] = useState<UserGoals>({
    daily: 5000000,    // 5M coins
    weekly: 30000000,  // 30M coins
    monthly: 120000000, // 120M coins
  });
  const [editingGoals, setEditingGoals] = useState<UserGoals>(goals);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const calculateProgress = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-success';
    if (progress >= 75) return 'bg-yellow-500';
    if (progress >= 50) return 'bg-orange-500';
    return 'bg-primary';
  };

  const saveGoals = () => {
    setGoals(editingGoals);
    setIsOpen(false);
    toast({
      title: "Goals updated",
      description: "Your profit goals have been saved successfully.",
    });
  };

  const resetGoals = () => {
    setEditingGoals(goals);
  };

  const goalData = [
    {
      label: 'Daily Goal',
      current: metrics.daily,
      goal: goals.daily,
      period: 'today',
    },
    {
      label: 'Weekly Goal',
      current: metrics.weekly,
      goal: goals.weekly,
      period: 'this week',
    },
    {
      label: 'Monthly Goal',
      current: metrics.monthly,
      goal: goals.monthly,
      period: 'this month',
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Profit Goals
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your progress toward your financial targets
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Goals
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profit Goals</DialogTitle>
              <DialogDescription>
                Set your daily, weekly, and monthly profit targets
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="daily-goal">Daily Goal (coins)</Label>
                <Input
                  id="daily-goal"
                  type="number"
                  value={editingGoals.daily}
                  onChange={(e) => setEditingGoals(prev => ({ 
                    ...prev, 
                    daily: parseInt(e.target.value) || 0 
                  }))}
                  placeholder="Enter daily profit goal"
                />
              </div>
              
              <div>
                <Label htmlFor="weekly-goal">Weekly Goal (coins)</Label>
                <Input
                  id="weekly-goal"
                  type="number"
                  value={editingGoals.weekly}
                  onChange={(e) => setEditingGoals(prev => ({ 
                    ...prev, 
                    weekly: parseInt(e.target.value) || 0 
                  }))}
                  placeholder="Enter weekly profit goal"
                />
              </div>
              
              <div>
                <Label htmlFor="monthly-goal">Monthly Goal (coins)</Label>
                <Input
                  id="monthly-goal"
                  type="number"
                  value={editingGoals.monthly}
                  onChange={(e) => setEditingGoals(prev => ({ 
                    ...prev, 
                    monthly: parseInt(e.target.value) || 0 
                  }))}
                  placeholder="Enter monthly profit goal"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetGoals}>
                Cancel
              </Button>
              <Button onClick={saveGoals}>
                Save Goals
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {goalData.map((goal, index) => {
          const progress = calculateProgress(goal.current, goal.goal);
          const isComplete = progress >= 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{goal.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(goal.current)} / {formatNumber(goal.goal)} {goal.period}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${isComplete ? 'text-success' : 'text-foreground'}`}>
                    {progress.toFixed(1)}%
                  </p>
                  {isComplete && (
                    <p className="text-xs text-success">✓ Complete!</p>
                  )}
                </div>
              </div>
              
              <Progress 
                value={progress} 
                className="h-2"
              />
              
              {!isComplete && goal.goal > goal.current && (
                <p className="text-xs text-muted-foreground">
                  {formatNumber(goal.goal - goal.current)} coins to go
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}