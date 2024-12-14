import axios from 'axios';
import type { ElevenLabsVoice, ElevenLabsResponse } from '@/types/elevenLabs';

const ELEVEN_LABS_API_URL = 'https://api.elevenlabs.io/v1';

class ElevenLabsService {
  apiKey: string;  // Changed to public for debugging

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVEN_LABS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('No Eleven Labs API key found in environment variables');
    }
  }

  private get headers() {
    return {
      'xi-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async getAllVoices(): Promise<ElevenLabsVoice[]> {
    try {
      console.log('Making request to Eleven Labs API...');
      console.log('API URL:', `${ELEVEN_LABS_API_URL}/voices`);
      console.log('Headers:', this.headers);
      
      const response = await axios.get<ElevenLabsResponse>(`${ELEVEN_LABS_API_URL}/voices`, {
        headers: this.headers,
      });

      if (!response.data.voices) {
        console.warn('No voices found in response:', response.data);
        return [];
      }

      console.log('Total voices received:', response.data.voices.length);
      console.log('Voice details:', response.data.voices.map(v => ({
        name: v.name,
        category: v.category,
        available_for_tiers: v.available_for_tiers
      })));

      console.log('Response received:', response.data);
      return response.data.voices;
    } catch (error) {
      console.error('Error fetching Eleven Labs voices:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
      throw error;
    }
  }

  async getVoicePreview(voiceId: string): Promise<string> {
    try {
      console.log('Making request to Eleven Labs API...');
      console.log('API URL:', `${ELEVEN_LABS_API_URL}/voices/${voiceId}`);
      console.log('Headers:', this.headers);
      
      const response = await axios.get(
        `${ELEVEN_LABS_API_URL}/voices/${voiceId}`,
        {
          headers: this.headers,
        }
      );
      
      console.log('Response received:', response.data);
      return response.data.preview_url;
    } catch (error) {
      console.error('Error fetching voice preview:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
      throw error;
    }
  }
}

export const elevenLabsService = new ElevenLabsService();
