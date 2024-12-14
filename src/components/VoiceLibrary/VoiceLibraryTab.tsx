import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { VoiceCard } from './VoiceCard';
import { VoiceFilters } from './VoiceFilters';
import { AddVoiceCloneModal } from './AddVoiceCloneModal';
import { VoiceDetailsModal } from './VoiceDetailsModal';
import type { Voice, Provider } from './types';
import { elevenLabsService } from '@/services/elevenLabs';
import { toast } from '@/components/ui/use-toast';

const allLanguages = [
  "English", "Spanish (Spain)", "Spanish (Mexico)", "French (France)", "French (Canada)",
  "German", "Italian", "Japanese", "Korean", "Portuguese (Brazil)", "Portuguese (Portugal)",
  "Russian", "Chinese (Mandarin)", "Chinese (Cantonese)"
];

const allProviders: Provider[] = [
  { name: "Talkai247", status: "Included", languages: ["English"] },
  { name: "11Labs", status: "Premium", languages: ["English"] },
  { name: "Playht", status: "Premium", languages: ["English"] },
  { name: "Deepgram", status: "Included", languages: ["English"] },
  { name: "Azure", status: "Included", languages: allLanguages },
];

export default function VoiceLibraryTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");
  const [selectedProvider, setSelectedProvider] = useState("All Providers");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [showAddVoiceModal, setShowAddVoiceModal] = useState(false);
  const [showVoiceDetailsModal, setShowVoiceDetailsModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching voices...');
        const elevenLabsVoices = await elevenLabsService.getAllVoices();
        
        const formattedVoices: Voice[] = elevenLabsVoices.map((voice) => ({
          id: voice.voice_id,
          name: voice.name,
          gender: voice.labels?.gender || "Not specified",
          nationality: voice.labels?.accent || "Not specified",
          language: "English",
          provider: "11Labs",
          traits: [
            voice.category,
            voice.labels?.description,
            voice.labels?.use_case,
            voice.labels?.age,
          ].filter((trait): trait is string => Boolean(trait)),
          preview_url: voice.preview_url,
          eleven_labs_id: voice.voice_id,
          category: voice.category,
          available_for_tiers: voice.available_for_tiers
        }));

        console.log('Formatted voices:', formattedVoices);
        setVoices(formattedVoices);
      } catch (error) {
        console.error('Error fetching voices:', error);
        toast({
          title: "Error",
          description: "Failed to fetch voices. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoices();
  }, []);

  const filteredVoices = voices.filter((voice) => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.nationality.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = selectedLanguage === "All Languages" || voice.language === selectedLanguage;
    const matchesProvider = selectedProvider === "All Providers" || voice.provider === selectedProvider;
    return matchesSearch && matchesLanguage && matchesProvider;
  });

  const handleVoiceSelect = (voice: Voice) => {
    setSelectedVoice(voice);
    setShowVoiceDetailsModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Voice Library</h2>
        <Button
          onClick={() => setShowAddVoiceModal(true)}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Voice
        </Button>
      </div>

      <VoiceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
        languages={allLanguages}
        providers={allProviders}
      />

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading voices...</p>
        </div>
      ) : filteredVoices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No voices found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredVoices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              onSelect={handleVoiceSelect}
            />
          ))}
        </div>
      )}

      <AddVoiceCloneModal
        isOpen={showAddVoiceModal}
        onClose={() => setShowAddVoiceModal(false)}
      />

      <VoiceDetailsModal
        voice={selectedVoice}
        isOpen={showVoiceDetailsModal}
        onClose={() => setShowVoiceDetailsModal(false)}
        providers={allProviders}
      />
    </div>
  );
}