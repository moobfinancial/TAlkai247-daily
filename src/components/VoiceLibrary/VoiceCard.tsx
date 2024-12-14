import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause } from 'lucide-react';
import { elevenLabsService } from '@/services/elevenLabs';
import { Copy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Voice {
  id: number | string;
  name: string;
  gender: string;
  nationality: string;
  language: string;
  provider: string;
  traits: string[];
  preview_url?: string;
  eleven_labs_id?: string;
  category?: string;
  available_for_tiers?: string[];
}

interface VoiceCardProps {
  voice: Voice;
  onSelect: (voice: Voice) => void;
}

export function VoiceCard({ voice, onSelect }: VoiceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    try {
      if (!audioUrl && voice.eleven_labs_id) {
        toast({
          title: "Loading preview...",
          description: "Fetching voice sample from ElevenLabs",
        });
        const previewUrl = await elevenLabsService.getVoicePreview(voice.eleven_labs_id);
        setAudioUrl(previewUrl);
      }
      
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          if (!audioUrl && !voice.preview_url) {
            toast({
              title: "No preview available",
              description: "This voice doesn't have a preview sample",
              variant: "destructive",
            });
            return;
          }
          await audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    } catch (error) {
      console.error('Error playing preview:', error);
      toast({
        title: "Error",
        description: "Failed to play voice preview",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-white">{voice.name}</h3>
            <span className="text-sm text-gray-400">{voice.nationality}</span>
          </div>
          <Badge variant={voice.provider === "Talkai247" ? "secondary" : "destructive"}>
            {voice.provider}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-400">{voice.gender} • {voice.language}</p>
          {voice.category && (
            <p className="text-xs text-gray-500">Category: {voice.category}</p>
          )}
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">ID: {voice.eleven_labs_id || 'N/A'}</p>
            {voice.eleven_labs_id && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 p-1"
                onClick={() => {
                  navigator.clipboard.writeText(voice.eleven_labs_id);
                  toast({
                    title: "Copied!",
                    description: "Voice ID copied to clipboard",
                  });
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
          {voice.available_for_tiers && voice.available_for_tiers.length > 0 && (
            <p className="text-xs text-gray-500">
              Available for: {voice.available_for_tiers.join(', ')}
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {voice.traits.map((trait, index) => (
              <Badge key={index} variant="outline" className="bg-gray-700">
                {trait}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button 
            size="sm" 
            variant="secondary" 
            className="w-24"
            onClick={handlePlay}
            disabled={!voice.eleven_labs_id && !voice.preview_url}
          >
            {isPlaying ? (
              <><Pause className="w-4 h-4 mr-2" /> Pause</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Play</>
            )}
          </Button>
          <Button 
            size="sm" 
            variant="default" 
            className="w-24"
            onClick={() => onSelect(voice)}
          >
            Select
          </Button>
        </div>
      </CardContent>
      {(audioUrl || voice.preview_url) && (
        <audio
          ref={audioRef}
          src={audioUrl || voice.preview_url}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      )}
    </Card>
  );
}