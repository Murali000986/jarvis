import axios from 'axios';

export interface AIResponse {
  content: string;
  provider: string;
  model?: string;
}

export interface AIError {
  message: string;
  provider: string;
  code?: string;
}

// Groq API Integration
export const groqAPI = {
  async generateResponse(prompt: string): Promise<AIResponse> {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('Groq API key not found');
    }

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are JARVIS, an advanced AI assistant. Respond in a helpful, intelligent, and slightly formal manner, similar to the AI assistant from Iron Man. Keep responses concise but informative.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1024,
          temperature: 0.7,
          top_p: 1,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        content: response.data.choices[0].message.content,
        provider: 'groq',
        model: 'llama3-70b-8192'
      };
    } catch (error: any) {
      console.error('Groq API Error:', error);
      throw {
        message: error.response?.data?.error?.message || 'Failed to get response from Groq',
        provider: 'groq',
        code: error.response?.status?.toString()
      } as AIError;
    }
  }
};

// Cohere API Integration
export const cohereAPI = {
  async generateResponse(prompt: string): Promise<AIResponse> {
    const apiKey = import.meta.env.VITE_COHERE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Cohere API key not found');
    }

    try {
      const response = await axios.post(
        'https://api.cohere.ai/v1/chat',
        {
          model: 'command-r-plus',
          message: prompt,
          temperature: 0.7,
          max_tokens: 1024,
          preamble: 'You are JARVIS, an advanced AI assistant. Respond in a helpful, intelligent, and slightly formal manner, similar to the AI assistant from Iron Man. Keep responses concise but informative.'
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        content: response.data.text,
        provider: 'cohere',
        model: 'command-r-plus'
      };
    } catch (error: any) {
      console.error('Cohere API Error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to get response from Cohere',
        provider: 'cohere',
        code: error.response?.status?.toString()
      } as AIError;
    }
  }
};

// Gemini API Integration
export const geminiAPI = {
  async generateResponse(prompt: string): Promise<AIResponse> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are JARVIS, an advanced AI assistant. Respond in a helpful, intelligent, and slightly formal manner, similar to the AI assistant from Iron Man. Keep responses concise but informative.\n\nUser: ${prompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.candidates[0]?.content?.parts[0]?.text;
      
      if (!content) {
        throw new Error('No content received from Gemini');
      }

      return {
        content,
        provider: 'gemini',
        model: 'gemini-pro'
      };
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw {
        message: error.response?.data?.error?.message || 'Failed to get response from Gemini',
        provider: 'gemini',
        code: error.response?.status?.toString()
      } as AIError;
    }
  }
};

// Main AI Service
export class AIService {
  private defaultProvider: string;

  constructor() {
    this.defaultProvider = import.meta.env.VITE_DEFAULT_AI_PROVIDER || 'groq';
  }

  async generateResponse(prompt: string, provider?: string): Promise<AIResponse> {
    const selectedProvider = provider || this.defaultProvider;

    try {
      switch (selectedProvider.toLowerCase()) {
        case 'groq':
          return await groqAPI.generateResponse(prompt);
        case 'cohere':
          return await cohereAPI.generateResponse(prompt);
        case 'gemini':
          return await geminiAPI.generateResponse(prompt);
        default:
          throw new Error(`Unknown AI provider: ${selectedProvider}`);
      }
    } catch (error) {
      console.error(`AI Service Error with ${selectedProvider}:`, error);
      
      // Fallback to other providers if the primary fails
      if (selectedProvider !== 'groq') {
        try {
          console.log('Falling back to Groq...');
          return await groqAPI.generateResponse(prompt);
        } catch (fallbackError) {
          console.error('Groq fallback failed:', fallbackError);
        }
      }
      
      if (selectedProvider !== 'cohere') {
        try {
          console.log('Falling back to Cohere...');
          return await cohereAPI.generateResponse(prompt);
        } catch (fallbackError) {
          console.error('Cohere fallback failed:', fallbackError);
        }
      }
      
      if (selectedProvider !== 'gemini') {
        try {
          console.log('Falling back to Gemini...');
          return await geminiAPI.generateResponse(prompt);
        } catch (fallbackError) {
          console.error('Gemini fallback failed:', fallbackError);
        }
      }
      
      // If all providers fail, throw the original error
      throw error;
    }
  }

  setDefaultProvider(provider: string): void {
    this.defaultProvider = provider;
  }

  getDefaultProvider(): string {
    return this.defaultProvider;
  }

  getAvailableProviders(): string[] {
    return ['groq', 'cohere', 'gemini'];
  }
}

// Export singleton instance
export const aiService = new AIService();