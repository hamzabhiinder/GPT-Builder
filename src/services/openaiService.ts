import { SavedGPT } from '../types/gpt';
import { knowledgeService } from './knowledgeService';
import { capabilitiesService } from './capabilitiesService';

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
      // Return a demo response if no API key is configured
      return await this.getDemoResponse(message, gpt);
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

  private async getDemoResponse(message: string, gpt: SavedGPT): Promise<string> {
    let response = '';
    
    // Check if we should use capabilities
    if (gpt.capabilities.web_search && capabilitiesService.shouldUseWebSearch(message)) {
      const searchResult = await capabilitiesService.performWebSearch(message);
      response += searchResult + '\n\n';
    }
    
    if (gpt.capabilities.dalle_image_generation && capabilitiesService.shouldGenerateImage(message)) {
      const imageResult = await capabilitiesService.generateImage(message);
      response += imageResult + '\n\n';
    }
    
    if (gpt.capabilities.code_interpreter && capabilitiesService.shouldExecuteCode(message)) {
      const codeResult = await capabilitiesService.executeCode(message);
      response += codeResult + '\n\n';
    }
    
    if (gpt.capabilities.canvas && capabilitiesService.shouldUseCanvas(message)) {
      const canvasResult = await capabilitiesService.createCanvas(message);
      response += canvasResult + '\n\n';
    }

    // Search knowledge base
    if (gpt.knowledge_files && gpt.knowledge_files.length > 0) {
      const knowledgeResults = knowledgeService.searchKnowledge(message, gpt.knowledge_files);
      if (knowledgeResults.length > 0) {
        response += '📚 **From Knowledge Base:**\n\n' + knowledgeResults.join('\n\n') + '\n\n';
      }
    }

    // Demo responses when no API key is configured
    const responses = [
      `Hello! I'm ${gpt.name}. ${gpt.description} How can I help you today?`,
      `As ${gpt.name}, I'm here to assist you. What would you like to know?`,
      `Thanks for your message! I'm ${gpt.name} and I'm ready to help you with your questions.`,
      `Great question! As ${gpt.name}, I can help you with that. Let me provide you with some information.`,
      `I understand you're asking about "${message}". As ${gpt.name}, I'm designed to help with exactly these kinds of questions.`
    ];
    
    // Simple response based on message content
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      response += `Hello! I'm ${gpt.name}. ${gpt.description} How can I assist you today?`;
    } else if (message.toLowerCase().includes('help')) {
      response += `I'm ${gpt.name} and I'm here to help! ${gpt.description} What specific assistance do you need?`;
    } else if (message.toLowerCase().includes('what') || message.toLowerCase().includes('how')) {
      response += `That's a great question! As ${gpt.name}, I can help you with that. ${gpt.description} Let me provide you with some guidance on this topic.`;
    } else {
      // Return a random response
      response += responses[Math.floor(Math.random() * responses.length)];
    }
    
    return response.trim();
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