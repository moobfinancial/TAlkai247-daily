import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import AssistantCard from './AssistantCard';
import AssistantWizard from '../AssistantWizard';
import DeleteConfirmation from '../DeleteConfirmation';
import { useToast } from "@/components/ui/use-toast";

interface Assistant {
  id: string;
  name: string;
  modes: string[];
  firstMessage: string;
  systemPrompt: string;
  provider: string;
  model: string;
  tools: any[];
  voice?: {
    provider: string;
    voiceId: string;
    settings: {
      speed: number;
      pitch: number;
      stability: number;
      volume: number;
    };
  };
}

export default function AssistantsTab() {
  const { toast } = useToast();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);

  const handleCreateAssistant = (assistant: Assistant) => {
    const newAssistant = {
      ...assistant,
      voice: assistant.voiceProvider ? {
        provider: assistant.voiceProvider,
        voiceId: assistant.voiceId,
        settings: {
          speed: 1,
          pitch: 1,
          stability: 0.75,
          volume: assistant.volume || 75
        }
      } : undefined
    };

    setAssistants([...assistants, newAssistant]);
    setShowWizard(false);
    toast({
      title: "Success",
      description: "Assistant created successfully"
    });
  };

  const handleDeleteAssistant = (assistant: Assistant) => {
    setSelectedAssistant(assistant);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedAssistant) {
      setAssistants(assistants.filter(a => a.id !== selectedAssistant.id));
      setSelectedAssistant(null);
      setShowDeleteDialog(false);
      toast({
        title: "Success",
        description: "Assistant deleted successfully"
      });
    }
  };

  const handleUpdateAssistant = (updatedAssistant: Assistant) => {
    setAssistants(assistants.map(assistant => 
      assistant.id === updatedAssistant.id ? updatedAssistant : assistant
    ));
    toast({
      title: "Success",
      description: "Assistant updated successfully"
    });
  };

  return (
    <div className="p-8 bg-gray-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-400">Assistants</h1>
          <p className="text-gray-400">Manage your AI assistants</p>
        </div>
        <Button 
          onClick={() => setShowWizard(true)}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Assistant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.map((assistant) => (
          <AssistantCard
            key={assistant.id}
            assistant={assistant}
            onDelete={() => handleDeleteAssistant(assistant)}
            onUpdate={handleUpdateAssistant}
          />
        ))}
      </div>

      {showWizard && (
        <AssistantWizard
          onClose={() => setShowWizard(false)}
          onComplete={handleCreateAssistant}
        />
      )}

      <DeleteConfirmation
        isOpen={showDeleteDialog}
        assistant={selectedAssistant}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedAssistant(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}