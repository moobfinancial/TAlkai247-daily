import axios from 'axios';

const PROXY_URL = 'http://localhost:3000/api';

interface DeepgramVoice {
  model_id: string;
  name: string;
  language: string;
  gender: string;
  description?: string;
  preview_url?: string;
  avatar_url?: string;
}

export const deepgramApi = {
  /**
   * Fetch available voices from Deepgram
   */
  async getVoices(): Promise<DeepgramVoice[]> {
    try {
      const response = await axios.get(`${PROXY_URL}/deepgram/voices`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Deepgram voices:', error);
      throw error;
    }
  },

  /**
   * Generate speech from text using Deepgram
   */
  async generateSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
    try {
      console.log('Generating speech with Deepgram:', { text, voiceId });
      const response = await axios.post(
        `${PROXY_URL}/deepgram/speech`,
        {
          text,
          voice: voiceId,
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
    try {
      const voices = await this.getVoices();
      const voice = voices.find(v => v.model_id === voiceId);
      
      if (!voice?.preview_url) {
        throw new Error('No preview URL available for this voice');
      }

      const response = await axios.get(voice.preview_url, {
        responseType: 'arraybuffer'
      });

      return response.data;
    } catch (error) {
      console.error('Error previewing voice:', error);
      throw error;
    }
  },
};

export type { DeepgramVoice };
