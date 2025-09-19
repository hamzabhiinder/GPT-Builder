import { SavedGPT } from '../types/gpt';

class OpenAIService {
  private apiKey: string | null = null;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = localStorage.getItem('openai_api_key');
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
  }

  getApiKey(): string | null {
    return this.apiKey || localStorage.getItem('openai_api_key');
  }

  async sendMessage(message: string, gpt: SavedGPT): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    try {
      // Create system message based on GPT configuration
      const systemMessage = this.createSystemMessage(gpt);
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: systemMessage
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  private createSystemMessage(gpt: SavedGPT): string {
    let systemMessage = `You are ${gpt.name}. ${gpt.description}\n\n`;
    systemMessage += `Instructions: ${gpt.instructions}\n\n`;
    
    // Add capabilities context
    const enabledCapabilities = [];
    if (gpt.capabilities.web_search) enabledCapabilities.push('web search');
    if (gpt.capabilities.dalle_image_generation) enabledCapabilities.push('image generation');
    if (gpt.capabilities.code_interpreter) enabledCapabilities.push('code execution and data analysis');
    if (gpt.capabilities.canvas) enabledCapabilities.push('canvas for visual content');
    
    if (enabledCapabilities.length > 0) {
      systemMessage += `You have access to: ${enabledCapabilities.join(', ')}.\n\n`;
    }

    // Add knowledge context if available
    if (gpt.knowledge_files && gpt.knowledge_files.length > 0) {
      systemMessage += `You have access to uploaded knowledge files. Use this information to provide accurate and contextual responses.\n\n`;
    }

    systemMessage += `Always respond in a helpful, accurate, and engaging manner according to your role and instructions.`;
    
    return systemMessage;
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const openaiService = new OpenAIService();