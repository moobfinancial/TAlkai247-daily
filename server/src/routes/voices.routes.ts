import { Router } from 'express';
import axios from 'axios';
import { wrapAsync } from '../types/route-handlers';

const router = Router();

router.get('/deepgram/voices', wrapAsync(async (req, res) => {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
  
  if (!deepgramApiKey) {
    console.error('DEEPGRAM_API_KEY is not configured');
    return res.status(500).json({
      error: 'Deepgram API key is not configured'
    });
  }

  try {
    console.log('Fetching Deepgram voices...');
    const response = await axios.get('https://api.deepgram.com/v1/speak/voices', {
      headers: {
        'Authorization': `Token ${deepgramApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const voices = response.data.map((voice: any) => ({
      model_id: voice.model_id || voice.id,
      name: voice.name || 'Unknown Voice',
      language: voice.language || 'en',
      gender: voice.gender || 'neutral',
      description: voice.description || '',
      preview_url: voice.preview_url || null,
      provider: 'Deepgram'
    }));

    console.log(`Successfully fetched ${voices.length} Deepgram voices`);
    return res.json(voices);
  } catch (error: any) {
    console.error('Deepgram API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    return res.status(500).json({
      error: 'Failed to fetch Deepgram voices',
      details: error.response?.data || error.message
    });
  }
}));

// PlayHT voices
router.get('/voices/playht', wrapAsync(async (req, res) => {
  try {
    console.log('Fetching PlayHT voices with API key:', process.env.PLAYHT_API_KEY?.slice(0, 5) + '...');
    const response = await axios.get('https://api.play.ht/api/v2/voices', {
      headers: {
        'Authorization': `Bearer ${process.env.PLAYHT_API_KEY}`,
        'X-User-Id': process.env.PLAYHT_USER_ID
      }
    });
    console.log('PlayHT response:', response.data);
    res.json(response.data || []);
  } catch (error: any) {
    console.error('PlayHT API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch PlayHT voices',
      details: error.response?.data || error.message
    });
  }
}));

// Cartesia voices
router.get('/voices/cartesia', wrapAsync(async (req, res) => {
  try {
    console.log('Fetching Cartesia voices with API key:', process.env.CARTESIA_API_KEY?.slice(0, 5) + '...');
    const response = await axios.get('https://api.cartesia.ai/v1/voices/list', {
      headers: {
        'X-API-Key': process.env.CARTESIA_API_KEY,
        'Cartesia-Version': '2024-06-10'
      }
    });
    console.log('Cartesia response:', response.data);
    res.json(response.data || []);
  } catch (error: any) {
    console.error('Cartesia API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch Cartesia voices',
      details: error.response?.data || error.message
    });
  }
}));

// ElevenLabs voices
router.get('/voices/elevenlabs', wrapAsync(async (req, res) => {
  try {
    console.log('Fetching ElevenLabs voices with API key:', process.env.ELEVENLABS_API_KEY?.slice(0, 5) + '...');
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });
    console.log('ElevenLabs response:', response.data);
    res.json(response.data || []);
  } catch (error: any) {
    console.error('ElevenLabs API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch ElevenLabs voices',
      details: error.response?.data || error.message
    });
  }
}));

export default router;
