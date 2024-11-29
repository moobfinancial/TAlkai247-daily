import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Volume2 } from 'lucide-react';
import { Card } from "@/components/ui/card";

interface VoiceProvider {
  id: string;
  name: string;
  costPerMinute: number;
  voices: Voice[];
}

interface Voice {
  id: string;
  name: string;
  description: string;
  sampleUrl: string;
  tags: string[];
}

const voiceProviders: VoiceProvider[] = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    costPerMinute: 0.03,
    voices: [
      {
        id: 'adam',
        name: 'Adam',
        description: 'Professional, deep male voice perfect for business communications',
        sampleUrl: 'https://api.elevenlabs.io/v1/text-to-speech/adam/stream',
        tags: ['male', 'professional', 'deep']
      },
      {
        id: 'rachel',
        name: 'Rachel',
        description: 'Natural female voice ideal for customer service',
        sampleUrl: 'https://api.elevenlabs.io/v1/text-to-speech/rachel/stream',
        tags: ['female', 'natural', 'friendly']
      },
      {
        id: 'antoni',
        name: 'Antoni',
        description: 'Friendly male voice great for casual conversations',
        sampleUrl: 'https://api.elevenlabs.io/v1/text-to-speech/antoni/stream',
        tags: ['male', 'friendly', 'casual']
      },
      {
        id: 'bella',
        name: 'Bella',
        description: 'Warm female voice perfect for empathetic interactions',
        sampleUrl: 'https://api.elevenlabs.io/v1/text-to-speech/bella/stream',
        tags: ['female', 'warm', 'empathetic']
      }
    ]
  },
  {
    id: 'playht',
    name: 'PlayHT',
    costPerMinute: 0.025,
    voices: [
      {
        id: 'matthew',
        name: 'Matthew',
        description: 'Conversational male voice for natural dialogues',
        sampleUrl: 'https://api.playht.com/v1/convert/matthew',
        tags: ['male', 'conversational', 'natural']
      },
      {
        id: 'emma',
        name: 'Emma',
        description: 'Clear female voice ideal for instructions and guidance',
        sampleUrl: 'https://api.playht.com/v1/convert/emma',
        tags: ['female', 'clear', 'instructional']
      },
      {
        id: 'james',
        name: 'James',
        description: 'British male accent adding sophistication',
        sampleUrl: 'https://api.playht.com/v1/convert/james',
        tags: ['male', 'british', 'sophisticated']
      },
      {
        id: 'sophie',
        name: 'Sophie',
        description: 'Australian female accent bringing uniqueness',
        sampleUrl: 'https://api.playht.com/v1/convert/sophie',
        tags: ['female', 'australian', 'unique']
      }
    ]
  },
  {
    id: 'deepgram',
    name: 'Deepgram',
    costPerMinute: 0.02,
    voices: [
      {
        id: 'nova',
        name: 'Nova',
        description: 'AI-optimized voice for clear communication',
        sampleUrl: 'https://api.deepgram.com/v1/speak/nova',
        tags: ['female', 'clear', 'AI-optimized']
      }
    ]
  },
  {
    id: 'google',
    name: 'Google Cloud TTS',
    costPerMinute: 0.016,
    voices: [
      {
        id: 'wavenet-a',
        name: 'WaveNet A',
        description: 'Neural network powered natural voice',
        sampleUrl: 'https://texttospeech.googleapis.com/v1/text:synthesize',
        tags: ['neural', 'natural', 'high-quality']
      }
    ]
  }
];

interface VoiceSelectionProps {
  formData: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function VoiceSelection({ formData, onNext, onBack }: VoiceSelectionProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>(formData.voiceProvider || '');
  const [selectedVoice, setSelectedVoice] = useState<string>(formData.voiceId || '');
  const [volume, setVolume] = useState<number>(formData.volume || 75);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentProvider = voiceProviders.find(p => p.id === selectedProvider);
  const currentVoice = currentProvider?.voices.find(v => v.id === selectedVoice);

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    setSelectedVoice('');
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  const playVoiceSample = async () => {
    if (!currentVoice || isPlaying) return;

    setIsPlaying(true);
    // In a real implementation, this would call the actual TTS API
    // For now, we'll simulate a voice sample
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPlaying(false);
  };

  const handleNext = () => {
    onNext({
      ...formData,
      voiceProvider: selectedProvider,
      voiceId: selectedVoice,
      volume: volume,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-white mb-2">Voice Provider</Label>
        <Select value={selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger className="w-full bg-gray-700 text-white border-gray-600">
            <SelectValue placeholder="Select a voice provider" />
          </SelectTrigger>
          <SelectContent>
            {voiceProviders.map(provider => (
              <SelectItem key={provider.id} value={provider.id}>
                <div className="flex justify-between items-center">
                  <span>{provider.name}</span>
                  <span className="text-sm text-gray-400">
                    ${provider.costPerMinute}/min
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProvider && (
        <div className="space-y-4">
          <Label className="text-white">Available Voices</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentProvider?.voices.map(voice => (
              <Card
                key={voice.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedVoice === voice.id
                    ? 'bg-teal-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => handleVoiceChange(voice.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-white">{voice.name}</h3>
                    <p className="text-sm text-gray-300">{voice.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      playVoiceSample();
                    }}
                    disabled={isPlaying}
                    className={selectedVoice === voice.id ? 'text-white' : 'text-gray-400'}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {voice.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedVoice && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-white">Voice Volume</Label>
            <span className="text-sm text-gray-400">{volume}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button
          onClick={onBack}
          variant="outline"
          className="bg-gray-700 text-white hover:bg-gray-600"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedProvider || !selectedVoice}
          className="bg-teal-600 hover:bg-teal-700"
        >
          Next
        </Button>
      </div>
    </div>
  );
}