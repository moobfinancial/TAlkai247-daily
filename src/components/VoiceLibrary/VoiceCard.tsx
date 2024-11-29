import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play } from 'lucide-react';

interface Voice {
  id: number;
  name: string;
  gender: string;
  nationality: string;
  language: string;
  provider: string;
  traits: string[];
}

interface VoiceCardProps {
  voice: Voice;
  onSelect: (voice: Voice) => void;
}

export function VoiceCard({ voice, onSelect }: VoiceCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-white">{voice.name}</h3>
            <p className="text-sm text-gray-400">{voice.nationality}</p>
          </div>
          <Badge variant={voice.provider === "Talkai247" ? "secondary" : "destructive"}>
            {voice.provider}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-400">{voice.gender} • {voice.language}</p>
          <div className="flex flex-wrap gap-1">
            {voice.traits.map((trait, index) => (
              <Badge key={index} variant="outline" className="bg-gray-700">
                {trait}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button size="sm" variant="secondary" className="w-24">
            <Play className="w-4 h-4 mr-2" /> Play
          </Button>
          <Button 
            size="sm" 
            className="w-24 bg-teal-600 hover:bg-teal-700"
            onClick={() => onSelect(voice)}
          >
            Select
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}