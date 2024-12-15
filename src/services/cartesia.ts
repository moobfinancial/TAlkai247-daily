import axios from 'axios';

const CARTESIA_API_KEY = import.meta.env.VITE_CARTESIA_API_KEY;
const CARTESIA_API_URL = 'https://api.cartesia.ai/v1';

interface CartesiaVoice {
  id: string;
  name: string;
  language: string;
  gender: string;
  description?: string;
  preview_url?: string;
  category?: string;
}

export const cartesiaApi = {
  /**
   * Fetch available voices from Cartesia API
   */
  async getVoices(): Promise<CartesiaVoice[]> {
    try {
      const response = await axios.get(`${CARTESIA_API_URL}/voices`, {
        headers: {
          'Authorization': `Bearer ${CARTESIA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.voices.map((voice: any) => ({
        id: voice.id,
        name: voice.name,
        language: voice.language,
        gender: voice.gender || 'Not specified',
        description: voice.description,
        preview_url: voice.preview_url,
        category: voice.category,
      }));
    } catch (error) {
      console.error('Error fetching Cartesia voices:', error);
      throw error;
    }
  },

  /**
   * Generate speech from text using Cartesia API
   */
  async generateSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
    try {
      const response = await axios.post(
        `${CARTESIA_API_URL}/text-to-speech`,
        {
          text,
          voice_id: voiceId,
          output_format: 'mp3',
        },
        {
          headers: {
            'Authorization': `Bearer ${CARTESIA_API_KEY}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  },

  /**
   * Preview a voice sample
   */
  async previewVoice(voiceId: string, previewUrl?: string): Promise<ArrayBuffer> {
    try {
      // If we have a preview URL, use that first
      if (previewUrl) {
        try {
          const response = await axios.get(previewUrl, {
            responseType: 'arraybuffer'
          });
          return response.data;
        } catch (error) {
          console.warn('Failed to fetch preview URL, falling back to text-to-speech:', error);
        }
      }

      // Fall back to generating speech if preview URL fails or is not available
      return this.generateSpeech('Hello! This is a preview of how I sound.', voiceId);
    } catch (error) {
      console.error('Error generating voice preview:', error);
      throw error;
    }
  },
};

export type { CartesiaVoice };
