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

// Proxy endpoint for PlayHT voices
app.get('/api/playht/voices', async (req, res) => {
  try {
    const response = await fetch('https://api.play.ht/api/v2/voices', {
      headers: {
        'Authorization': `Bearer ${process.env.VITE_PLAYHT_API_KEY}`,
        'X-User-ID': process.env.VITE_PLAYHT_USER_ID
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching PlayHT voices:', error);
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
