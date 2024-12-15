import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import path from 'path';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory's .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Check if we have the Deepgram API key
const deepgramApiKey = process.env.VITE_DEEPGRAM_API_KEY;
if (!deepgramApiKey) {
  console.error('VITE_DEEPGRAM_API_KEY environment variable is not set');
  process.exit(1);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    deepgramApiKey: deepgramApiKey ? 'present' : 'missing'
  });
});

// Endpoint to generate speech
app.post('/api/deepgram/speech', async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    if (!text || !voice) {
      return res.status(400).json({ error: 'Missing required parameters: text and voice' });
    }

    console.log('Generating speech:', { text, voice });
    
    try {
      const response = await fetch('https://api.deepgram.com/v1/speak', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${deepgramApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          model_id: voice
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Deepgram API error response:', errorText);
        throw new Error(`Deepgram API error: ${response.status} ${errorText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      console.log('Got Deepgram response');

      res.set('Content-Type', 'audio/mpeg');
      res.send(Buffer.from(audioBuffer));
    } catch (deepgramError) {
      console.error('Deepgram API error:', deepgramError);
      res.status(500).json({ 
        error: 'Deepgram API error',
        details: deepgramError.message,
        apiKey: deepgramApiKey ? 'present' : 'missing'
      });
    }
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get voices
app.get('/api/deepgram/voices', async (req, res) => {
  try {
    const response = await fetch('https://api.deepgram.com/v1/models', {
      headers: {
        'Authorization': `Token ${deepgramApiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }

    const data = await response.json();
    const voices = data.tts?.map(voice => ({
      model_id: voice.canonical_name,
      name: voice.name,
      language: voice.language,
      gender: voice.metadata?.tags?.includes('masculine') ? 'male' : 'female',
      description: `${voice.metadata?.accent || ''} accent`,
      preview_url: voice.metadata?.sample || '',
      provider: 'Deepgram'
    })) || [];

    res.json(voices);
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ error: error.message });
  }
});

// PlayHT endpoints
app.get('/api/playht/voices', async (req, res) => {
  try {
    // Log environment variables (safely)
    console.log('PlayHT API Configuration:', {
      apiKeyPresent: !!process.env.VITE_PLAYHT_API_KEY,
      apiKeyLength: process.env.VITE_PLAYHT_API_KEY?.length,
      userIdPresent: !!process.env.VITE_PLAYHT_USER_ID,
      userIdLength: process.env.VITE_PLAYHT_USER_ID?.length
    });

    const headers = {
      'accept': 'application/json',
      'AUTHORIZATION': process.env.VITE_PLAYHT_API_KEY,
      'X-USER-ID': process.env.VITE_PLAYHT_USER_ID
    };

    console.log('Request headers:', headers);

    const response = await fetch('https://api.play.ht/api/v2/voices', {
      method: 'GET',
      headers: headers
    });
    
    console.log('PlayHT API Response Status:', response.status);
    console.log('PlayHT API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('PlayHT API Error Response:', errorText);
      throw new Error(`Failed to fetch voices: ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    console.log('PlayHT API Response Data:', JSON.stringify(data, null, 2));

    // Send the voices array directly
    const voices = Array.isArray(data) ? data : [];
    console.log(`Found ${voices.length} voices`);
    res.json(voices);
  } catch (error) {
    console.error('Error fetching PlayHT voices:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/playht/speech', async (req, res) => {
  try {
    const { text, voice, quality, output_format } = req.body;
    
    // Create conversion request
    const response = await fetch('https://api.play.ht/api/v2/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_PLAYHT_API_KEY}`,
        'X-User-ID': process.env.VITE_PLAYHT_USER_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        voice,
        quality,
        output_format
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate speech: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Get the audio data
    const audioResponse = await fetch(data.audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    
    // Set appropriate headers
    res.set('Content-Type', 'audio/mpeg');
    res.set('Content-Length', audioBuffer.byteLength);
    
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Error generating speech with PlayHT:', error);
    res.status(500).json({ error: error.message });
  }
});

// PlayHT preview endpoint
app.get('/api/playht/preview', async (req, res) => {
  try {
    const previewUrl = req.query.url;
    if (!previewUrl) {
      throw new Error('Preview URL is required');
    }

    console.log('Fetching preview from URL:', previewUrl);

    const response = await fetch(previewUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch preview: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    
    // Set appropriate content type based on the URL
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.byteLength);
    
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error fetching voice preview:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server with proper error handling
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Environment variables loaded:', {
    deepgramApiKey: deepgramApiKey ? 'present' : 'missing'
  });
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please ensure no other server is running.`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});
