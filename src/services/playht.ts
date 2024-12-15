import axios from 'axios';

const PROXY_URL = 'http://localhost:3000/api';

interface PlayHTVoice {
  id: string;
  name: string;
  language: string;
  languageCode: string;
  gender: string;
  voiceEngine: string;
  preview_url?: string;
  description?: string;
}

export const playhtApi = {
  /**
   * Fetch available voices from PlayHT API
   */
  async getVoices(): Promise<PlayHTVoice[]> {
    try {
      const response = await axios.get(`${PROXY_URL}/playht/voices`);

      console.log('PlayHT voices fetched:', response.data);
      
      return response.data.voices.map((voice: any) => ({
        id: voice.id,
        name: voice.name,
        language: voice.language,
        languageCode: voice.languageCode,
        gender: voice.gender || 'unknown',
        voiceEngine: voice.voiceEngine,
        preview_url: voice.previewUrl,
        description: voice.description,
      }));
    } catch (error) {
      console.error('Error fetching PlayHT voices:', error);
      throw error;
    }
  },

  /**
   * Generate speech from text using PlayHT API
   */
  async generateSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
    try {
      console.log('Generating speech with PlayHT:', { text, voiceId });
      const response = await axios.post(
        `${PROXY_URL}/playht/speech`,
        {
          text,
          voice: voiceId,
          quality: 'medium',
          output_format: 'mp3',
          speed: 1,
          sample_rate: 24000,
        },
        {
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
  async previewVoice(voiceId: string): Promise<ArrayBuffer> {
    return this.generateSpeech('Hello! This is a preview of how I sound.', voiceId);
  },
};

export type { PlayHTVoice };
