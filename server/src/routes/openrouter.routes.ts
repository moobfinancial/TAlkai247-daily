import { Router } from 'express';
import axios from 'axios';
import { wrapAsync } from '../types/route-handlers';

const router = Router();

// Get OpenRouter models
router.get('/models', wrapAsync(async (req, res) => {
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.VITE_OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.VITE_API_URL,
      }
    });

    res.json({
      success: true,
      data: response.data.data
    });
  } catch (error: any) {
    console.error('OpenRouter API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch models from OpenRouter'
    });
  }
}));

export default router;
