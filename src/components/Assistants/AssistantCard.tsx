import React, { useState, useEffect } from 'react';
import { Share2, Settings, Mic, Trash2, Play, Command, MicOff, Send, Volume2, Save, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Assistant {
  id: string;
  name: string;
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

interface AssistantCardProps {
  assistant: Assistant;
  onDelete: () => void;
  onUpdate?: (assistant: Assistant) => void;
}

const voiceProviders = [
  { id: 'elevenlabs', name: 'ElevenLabs' },
  { id: 'playht', name: 'PlayHT' },
  { id: 'deepgram', name: 'Deepgram' },
  { id: 'google', name: 'Google Cloud TTS' }
];

const voiceOptions = {
  elevenlabs: [
    { id: 'adam', name: 'Adam (Professional Male)' },
    { id: 'rachel', name: 'Rachel (Natural Female)' },
    { id: 'antoni', name: 'Antoni (Friendly Male)' },
    { id: 'bella', name: 'Bella (Warm Female)' }
  ],
  playht: [
    { id: 'matthew', name: 'Matthew (Conversational Male)' },
    { id: 'emma', name: 'Emma (Clear Female)' },
    { id: 'james', name: 'James (British Male)' },
    { id: 'sophie', name: 'Sophie (Australian Female)' }
  ],
  deepgram: [
    { id: 'nova', name: 'Nova (AI-Optimized)' }
  ],
  google: [
    { id: 'wavenet-a', name: 'WaveNet A (Neural)' }
  ]
};

export default function AssistantCard({ assistant, onDelete, onUpdate }: AssistantCardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('model');
  const [isEditing, setIsEditing] = useState(false);
  const [editedAssistant, setEditedAssistant] = useState(assistant);
  const [testMessage, setTestMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<Array<{role: string, content: string}>>([]);
  const [testing, setTesting] = useState(false);

  const handleSave = () => {
    onUpdate?.(editedAssistant);
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Assistant updated successfully"
    });
  };

  const handleTest = async () => {
    if (!testMessage.trim()) return;

    setTesting(true);
    setTranscript(prev => [...prev, { role: 'user', content: testMessage }]);
    
    // Simulate AI response
    setTimeout(() => {
      setTranscript(prev => [...prev, { 
        role: 'assistant', 
        content: `I understand you said: "${testMessage}". Here's my response...` 
      }]);
      setTestMessage('');
      setTesting(false);
    }, 1000);
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast({
        title: "Voice Input Active",
        description: "Listening for your voice input..."
      });
    }
  };

  const handleVoiceProviderChange = (provider: string) => {
    setEditedAssistant(prev => ({
      ...prev,
      voice: {
        ...prev.voice,
        provider,
        voiceId: '',
      }
    }));
  };

  const handleVoiceIdChange = (voiceId: string) => {
    setEditedAssistant(prev => ({
      ...prev,
      voice: {
        ...prev.voice,
        voiceId,
      }
    }));
  };

  const handleVolumeChange = (value: number) => {
    setEditedAssistant(prev => ({
      ...prev,
      voice: {
        ...prev.voice,
        settings: {
          ...prev.voice?.settings,
          volume: value,
        }
      }
    }));
  };

  return (
    <TooltipProvider>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      value={editedAssistant.name}
                      onChange={(e) => setEditedAssistant({ ...editedAssistant, name: e.target.value })}
                      className="text-xl font-semibold text-white bg-gray-700 border-gray-600"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit assistant name</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <h2 className="text-xl font-semibold text-white truncate">{assistant.name}</h2>
              )}
              <p className="text-sm text-gray-400">ID: {assistant.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditedAssistant(assistant);
                          setIsEditing(false);
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cancel editing</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSave}
                        className="text-teal-400 hover:text-teal-300"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save changes</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share assistant</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditing(true)}
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit assistant settings</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={onDelete}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete assistant</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-gray-700">
              <TabsTrigger value="model">Model</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
            </TabsList>

            {activeTab === 'model' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">First Message</label>
                  <Textarea
                    value={isEditing ? editedAssistant.firstMessage : assistant.firstMessage}
                    onChange={(e) => setEditedAssistant({ ...editedAssistant, firstMessage: e.target.value })}
                    className="bg-gray-700 text-white border-gray-600"
                    placeholder="Enter the first message your assistant will say"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">System Prompt</label>
                  <Textarea
                    value={isEditing ? editedAssistant.systemPrompt : assistant.systemPrompt}
                    onChange={(e) => setEditedAssistant({ ...editedAssistant, systemPrompt: e.target.value })}
                    className="bg-gray-700 text-white border-gray-600"
                    placeholder="Enter the system prompt that defines your assistant's behavior"
                    rows={4}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Provider</label>
                    <Select
                      value={isEditing ? editedAssistant.provider : assistant.provider}
                      onValueChange={(value) => setEditedAssistant({ ...editedAssistant, provider: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Model</label>
                    <Select
                      value={isEditing ? editedAssistant.model : assistant.model}
                      onValueChange={(value) => setEditedAssistant({ ...editedAssistant, model: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-2">Claude 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Voice Provider</label>
                  <Select
                    value={editedAssistant.voice?.provider || ''}
                    onValueChange={handleVoiceProviderChange}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Select voice provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceProviders.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editedAssistant.voice?.provider && (
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Voice Selection</label>
                    <Select
                      value={editedAssistant.voice?.voiceId || ''}
                      onValueChange={handleVoiceIdChange}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceOptions[editedAssistant.voice.provider as keyof typeof voiceOptions]?.map(voice => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {editedAssistant.voice?.voiceId && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-400">Volume</label>
                      <span className="text-sm text-gray-400">
                        {editedAssistant.voice?.settings?.volume || 75}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-4 w-4 text-gray-400" />
                      <Slider
                        value={[editedAssistant.voice?.settings?.volume || 75]}
                        onValueChange={([value]) => handleVolumeChange(value)}
                        max={100}
                        step={1}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="space-y-4">
                {assistant.tools && assistant.tools.length > 0 ? (
                  assistant.tools.map((tool, index) => (
                    <div key={index} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-medium">{tool.id}</h4>
                          <p className="text-sm text-gray-400">
                            {Object.entries(tool.config).map(([key, value]) => (
                              `${key}: ${value}`
                            )).join(', ')}
                          </p>
                        </div>
                        <Badge variant="secondary">{tool.id}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No tools configured
                  </div>
                )}
              </div>
            )}

            {activeTab === 'test' && (
              <div className="space-y-4">
                <ScrollArea className="h-[300px] bg-gray-900 rounded-lg p-4">
                  {transcript.map((entry, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg mb-2 ${
                        entry.role === 'user' ? 'bg-gray-700 ml-12' : 'bg-teal-900/50 mr-12'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {entry.role === 'user' ? 'You' : assistant.name}
                      </p>
                      <p className="text-gray-300">{entry.content}</p>
                    </div>
                  ))}
                </ScrollArea>

                <div className="flex space-x-2">
                  <Input
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-700 border-gray-600"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleTest();
                      }
                    }}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleVoiceInput}
                        className={isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isListening ? 'Stop voice input' : 'Start voice input'}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleTest}
                        disabled={!testMessage.trim() || testing}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send message</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}