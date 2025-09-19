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
      // Return enhanced demo response if no API key is configured
      return await this.getEnhancedDemoResponse(message, gpt);
    }

    try {
      // Create system message based on GPT configuration
      const systemMessage = this.createSystemMessage(gpt);
      
      // Add knowledge context if available
      const knowledgeContext = this.getKnowledgeContext(message, gpt);
      const fullMessage = knowledgeContext ? `${knowledgeContext}\n\nUser Question: ${message}` : message;
      
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
              content: fullMessage
            }
          ],
          max_tokens: 1500,
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
      // Fallback to demo response on API error
      return await this.getEnhancedDemoResponse(message, gpt);
    }
  }

  private async getEnhancedDemoResponse(message: string, gpt: SavedGPT): Promise<string> {
    let response = '';
    
    // Add knowledge base search results
    if (gpt.knowledge_files && gpt.knowledge_files.length > 0) {
      const knowledgeResults = knowledgeService.searchKnowledge(message, gpt.knowledge_files);
      if (knowledgeResults.length > 0) {
        response += '📚 **Knowledge Base Results:**\n\n';
        response += knowledgeResults.join('\n\n') + '\n\n';
        response += '---\n\n';
      }
    }
    
    // Check capabilities and add relevant responses
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

    // Generate contextual response based on GPT's role and instructions
    response += this.generateContextualResponse(message, gpt);
    
    return response.trim();
  }

  private generateContextualResponse(message: string, gpt: SavedGPT): string {
    const messageLower = message.toLowerCase();
    const gptName = gpt.name;
    const gptRole = this.extractGPTRole(gpt);
    
    // Greeting responses
    if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('hey')) {
      return `Hello! I'm ${gptName}, your ${gptRole}. ${gpt.description} How can I assist you today?`;
    }
    
    // Help requests
    if (messageLower.includes('help') || messageLower.includes('assist')) {
      return `I'm here to help! As ${gptName}, I specialize in ${this.getSpecialties(gpt)}. What specific assistance do you need?`;
    }
    
    // Question responses
    if (messageLower.includes('what') || messageLower.includes('how') || messageLower.includes('why')) {
      return `Great question! As ${gptName}, I can help you understand this topic. ${this.generateTopicResponse(message, gpt)}`;
    }
    
    // Task-specific responses
    if (messageLower.includes('create') || messageLower.includes('make') || messageLower.includes('build')) {
      return `I'd be happy to help you create that! As ${gptName}, I can guide you through the process. ${this.generateCreationResponse(message, gpt)}`;
    }
    
    // Analysis requests
    if (messageLower.includes('analyze') || messageLower.includes('review') || messageLower.includes('check')) {
      return `I'll analyze that for you. As ${gptName}, I can provide detailed insights. ${this.generateAnalysisResponse(message, gpt)}`;
    }
    
    // Default contextual response
    return `Thank you for your message! As ${gptName}, I'm designed to ${gpt.description.toLowerCase()}. Based on your request about "${message}", I can help you by providing expert guidance and support. Let me know what specific aspect you'd like to focus on!`;
  }

  private extractGPTRole(gpt: SavedGPT): string {
    const name = gpt.name.toLowerCase();
    if (name.includes('writer') || name.includes('write')) return 'writing assistant';
    if (name.includes('scholar') || name.includes('research')) return 'research assistant';
    if (name.includes('code') || name.includes('mentor')) return 'programming mentor';
    if (name.includes('business') || name.includes('advisor')) return 'business advisor';
    if (name.includes('design') || name.includes('creative')) return 'creative designer';
    if (name.includes('data') || name.includes('analyst')) return 'data analyst';
    return 'AI assistant';
  }

  private getSpecialties(gpt: SavedGPT): string {
    const capabilities = [];
    if (gpt.capabilities.web_search) capabilities.push('web research');
    if (gpt.capabilities.dalle_image_generation) capabilities.push('image generation');
    if (gpt.capabilities.code_interpreter) capabilities.push('code analysis');
    if (gpt.capabilities.canvas) capabilities.push('visual collaboration');
    
    const role = this.extractGPTRole(gpt);
    return capabilities.length > 0 ? `${role} with ${capabilities.join(', ')} capabilities` : role;
  }

  private generateTopicResponse(message: string, gpt: SavedGPT): string {
    const role = this.extractGPTRole(gpt);
    return `Let me explain this from the perspective of a ${role}. I'll break this down into clear, actionable insights that you can apply immediately.`;
  }

  private generateCreationResponse(message: string, gpt: SavedGPT): string {
    const role = this.extractGPTRole(gpt);
    return `As a ${role}, I'll help you create something excellent. I'll provide step-by-step guidance and best practices to ensure high-quality results.`;
  }

  private generateAnalysisResponse(message: string, gpt: SavedGPT): string {
    const role = this.extractGPTRole(gpt);
    return `I'll provide a thorough analysis from the perspective of a ${role}. I'll examine all relevant aspects and give you actionable recommendations.`;
  }

  private getKnowledgeContext(message: string, gpt: SavedGPT): string {
    if (!gpt.knowledge_files || gpt.knowledge_files.length === 0) {
      return '';
    }

    const knowledgeResults = knowledgeService.searchKnowledge(message, gpt.knowledge_files);
    if (knowledgeResults.length === 0) {
      return '';
    }

    return `Context from uploaded knowledge base:\n${knowledgeResults.join('\n\n')}\n\nPlease use this context to provide accurate and relevant information.`;
  }

  private createSystemMessage(gpt: SavedGPT): string {
    let systemMessage = `You are ${gpt.name}. ${gpt.description}\n\n`;
    systemMessage += `Core Instructions:\n${gpt.instructions}\n\n`;
    
    // Add capabilities context
    const enabledCapabilities = [];
    if (gpt.capabilities.web_search) enabledCapabilities.push('web search for current information');
    if (gpt.capabilities.dalle_image_generation) enabledCapabilities.push('image generation using DALL-E');
    if (gpt.capabilities.code_interpreter) enabledCapabilities.push('code execution and data analysis');
    if (gpt.capabilities.canvas) enabledCapabilities.push('canvas for visual content creation');
    
    if (enabledCapabilities.length > 0) {
      systemMessage += `Available Tools: ${enabledCapabilities.join(', ')}.\n\n`;
    }

    // Add knowledge context if available
    if (gpt.knowledge_files && gpt.knowledge_files.length > 0) {
      systemMessage += `Knowledge Base: You have access to ${gpt.knowledge_files.length} uploaded document(s). Use this information to provide accurate, contextual responses. Always cite the source when referencing uploaded content.\n\n`;
    }

    // Add conversation starters context
    if (gpt.conversation_starters && gpt.conversation_starters.length > 0) {
      systemMessage += `Common Topics: Users often ask about: ${gpt.conversation_starters.filter(s => s).join('; ')}.\n\n`;
    }

    systemMessage += `Response Guidelines:
- Always stay in character as ${gpt.name}
- Provide helpful, accurate, and engaging responses
- Use your specialized knowledge and capabilities
- Ask clarifying questions when needed
- Be professional yet approachable
- Cite sources when using uploaded knowledge`;
    
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