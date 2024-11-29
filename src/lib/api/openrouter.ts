import axios from 'axios';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = import.meta.env.VITE_OPENROUTER_BASE_URL;

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

function sanitizeModel(model: any): Model {
  return {
    id: String(model.id || ''),
    name: String(model.name || ''),
    description: String(model.description || ''),
    context_length: Number.isInteger(model.context_length) ? model.context_length : 4096,
    pricing: {
      prompt: typeof model.pricing?.prompt === 'number' ? model.pricing.prompt : 0,
      completion: typeof model.pricing?.completion === 'number' ? model.pricing.completion : 0
    }
  };
}

function sanitizeResponse(response: any): any {
  if (Array.isArray(response)) {
    return response.map(item => sanitizeResponse(item));
  }
  
  if (response === null || response === undefined) {
    return response;
  }

  if (typeof response === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(response)) {
      sanitized[key] = sanitizeResponse(value);
    }
    return sanitized;
  }

  // Convert all other types to strings or numbers
  return typeof response === 'number' ? response : String(response);
}

export const openRouterApi = {
  async chat(options: CompletionOptions): Promise<ApiResponse<any>> {
    try {
      const response = await axios.post(
        `${OPENROUTER_BASE_URL}/chat/completions`,
        {
          model: options.model,
          messages: options.messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://talkai247.com',
            'X-Title': 'Talkai247'
          }
        }
      );

      return {
        success: true,
        data: sanitizeResponse(response.data)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'OPENROUTER_API_ERROR',
          message: 'Failed to complete chat request',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  },

  async getModels(): Promise<Model[]> {
    try {
      const response = await axios.get(`${OPENROUTER_BASE_URL}/models`, {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        }
      });

      if (!Array.isArray(response.data?.data)) {
        console.error('Invalid response format from OpenRouter API');
        return [];
      }

      return response.data.data.map(sanitizeModel);
    } catch (error) {
      console.error('Failed to fetch models:', error);
      return [];
    }
  }
};