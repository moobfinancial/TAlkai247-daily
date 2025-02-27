import axios from 'axios';

interface CartesiaVoice {
  id: string;
  name: string;
  language: string;
  gender: string;
  preview_url?: string;
  provider: string;
}

export const cartesiaApi = {
  /**
   * Fetch available voices from Cartesia API
   */
  async getVoices(): Promise<CartesiaVoice[]> {
    try {
      console.log('Fetching Cartesia voices...');
      const response = await axios.get('/api/cartesia/voices');
      console.log('Cartesia API Response:', response);

      const voices = Array.isArray(response.data) ? response.data : [];
      console.log(`Processing ${voices.length} voices`);

      return voices.map((voice: any, index: number) => ({
        id: voice.id || `unknown-${index}`,
        name: voice.name || 'Unknown Voice',
        language: voice.language || 'en',
        gender: voice.gender || 'neutral',
        preview_url: voice.preview_url || '',
        provider: 'Cartesia'
      }));
    } catch (error) {
      console.error('Error fetching Cartesia voices:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  },

  /**
   * Generate speech from text using Cartesia API
   */
  async generateSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
    try {
      console.log('Generating speech with Cartesia:', { text, voiceId });
      
      const response = await axios.post('/api/cartesia/speech', {
        text,
        voice_id: voiceId,
        output_format: 'mp3'
      }, {
        responseType: 'arraybuffer'
      });

      return response.data;
    } catch (error) {
      console.error('Error generating speech with Cartesia:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  },

  /**
   * Preview a voice sample
   */
  async previewVoice(voiceId: string): Promise<ArrayBuffer> {
    try {
      console.log('Previewing Cartesia voice:', voiceId);
      
      // Get the voice details including preview URL
      const voices = await this.getVoices();
      const voice = voices.find(v => v.id === voiceId);
      
      if (!voice) {
        throw new Error('Voice not found');
      }

      if (!voice.preview_url) {
        throw new Error('No preview URL available for this voice');
      }

      console.log('Using preview URL:', voice.preview_url);
      
      // Fetch the audio data through our proxy
      const response = await axios.get(`/api/cartesia/preview?url=${encodeURIComponent(voice.preview_url)}`, {
        responseType: 'arraybuffer'
      });

      return response.data;
    } catch (error) {
      console.error('Error previewing Cartesia voice:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  }
};
