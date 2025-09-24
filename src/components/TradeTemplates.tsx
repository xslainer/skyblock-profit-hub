import { useState } from 'react';
import { TradeCategory } from '@/types/trade';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradeTemplate {
  id: string;
  name: string;
  itemName: string;
  category: TradeCategory;
  createdAt: Date;
}

interface TradeTemplatesProps {
  onTemplateSelect: (template: TradeTemplate) => void;
}

export function TradeTemplates({ onTemplateSelect }: TradeTemplatesProps) {
  const [templates, setTemplates] = useState<TradeTemplate[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    itemName: '',
    category: '' as TradeCategory
  });
  const { toast } = useToast();

  const createTemplate = () => {
    if (!newTemplate.name || !newTemplate.itemName || !newTemplate.category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields to create a template.",
        variant: "destructive",
      });
      return;
    }

    const template: TradeTemplate = {
      id: crypto.randomUUID(),
      name: newTemplate.name,
      itemName: newTemplate.itemName,
      category: newTemplate.category,
      createdAt: new Date()
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: '', itemName: '', category: '' as TradeCategory });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Template created",
      description: `Template "${template.name}" has been saved.`,
    });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Template deleted",
      description: "Template has been removed.",
    });
  };

  const categories: TradeCategory[] = ['Armors', 'Swords', 'Bows', 'Skins', 'Dyes', 'Miscellaneous', 'Accessories'];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Trade Templates
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Save and reuse common item configurations
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Trade Template</DialogTitle>
              <DialogDescription>
                Save a template for items you trade frequently
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Hyperion Template"
                />
              </div>
              
              <div>
                <Label htmlFor="template-item">Item Name</Label>
                <Input
                  id="template-item"
                  value={newTemplate.itemName}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, itemName: e.target.value }))}
                  placeholder="e.g., Hyperion"
                />
              </div>
              
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select value={newTemplate.category} onValueChange={(value: TradeCategory) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createTemplate}>
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No templates created yet. Create your first template to speed up trade entry.
          </p>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {template.itemName} • {template.category}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTemplateSelect(template)}
                  >
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}