import axios from 'axios';

interface DeepgramVoice {
  id: string;
  name: string;
  language: string;
  gender: string;
  provider: string;
  description?: string;
  preview_url?: string;
  model_id: string;
}

export const deepgramApi = {
  /**
   * Fetch available voices from Deepgram API
   */
  async getVoices(): Promise<DeepgramVoice[]> {
    try {
      console.log('Fetching Deepgram voices...');
      const response = await axios.get('/api/deepgram/voices', {
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const voices = Array.isArray(response.data) ? response.data : [];
      console.log(`Successfully processed ${voices.length} Deepgram voices`);

      return voices.map((voice: any) => ({
        id: voice.id || voice.model_id,
        name: voice.name || 'Unknown Voice',
        language: voice.language || 'en',
        gender: voice.gender || 'neutral',
        provider: 'Deepgram',
        description: voice.description || '',
        preview_url: voice.preview_url || null,
        model_id: voice.model_id || voice.id
      }));
    } catch (error) {
      console.error('Error fetching Deepgram voices:', error);
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
   * Generate speech from text using Deepgram API
   */
  async generateSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
    try {
      console.log('Generating speech with Deepgram:', { text, voiceId });
      
      const response = await axios.post('/api/deepgram/speech', {
        text,
        voice: voiceId,
        output_format: 'mp3'
      }, {
        responseType: 'arraybuffer',
        timeout: 30000 // 30 second timeout
      });

      return response.data;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }
};
