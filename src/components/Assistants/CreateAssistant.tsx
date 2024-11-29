import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { assistantsApi } from '@/lib/api/assistants';

interface Model {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: number;
    completion: number;
  };
}

interface CreateAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateAssistant({ isOpen, onClose, onCreated }: CreateAssistantProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    systemPrompt: '',
    firstMessage: '',
    tools: []
  });

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await assistantsApi.getModels();
        setModels(response);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch available models",
          variant: "destructive"
        });
      }
    };

    if (isOpen) {
      fetchModels();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await assistantsApi.createAssistant(formData);
      toast({
        title: "Success",
        description: "Assistant created successfully"
      });
      onCreated();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assistant",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New AI Assistant</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Assistant Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-700 border-gray-600"
              placeholder="e.g., Customer Support Assistant"
              required
            />
          </div>

          <div>
            <Label>Language Model</Label>
            <Select
              value={formData.model}
              onValueChange={(value) => setFormData({ ...formData, model: value })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex justify-between items-center">
                      <span>{model.name}</span>
                      <span className="text-sm text-gray-400">
                        ${model.pricing.prompt}/1K tokens
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>System Prompt</Label>
            <Textarea
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              className="bg-gray-700 border-gray-600 min-h-[100px]"
              placeholder="Define the assistant's behavior and capabilities..."
              required
            />
          </div>

          <div>
            <Label>First Message</Label>
            <Textarea
              value={formData.firstMessage}
              onChange={(e) => setFormData({ ...formData, firstMessage: e.target.value })}
              className="bg-gray-700 border-gray-600"
              placeholder="The first message the assistant will send..."
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Assistant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}