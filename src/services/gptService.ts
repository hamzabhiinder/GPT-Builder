import { GPTConfig, SavedGPT } from '../types/gpt';
import { openaiService } from './openaiService';

// Local storage keys
const STORAGE_KEYS = {
  SAVED_GPTS: 'saved_gpts',
  API_KEY: 'openai_api_key'
};

export class GPTService {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (this.apiKey) {
      openaiService.setApiKey(this.apiKey);
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    openaiService.setApiKey(apiKey);
  }

  getApiKey(): string | null {
    return this.apiKey || localStorage.getItem(STORAGE_KEYS.API_KEY);
  }

  // Save GPT to local storage
  async saveGPT(gptConfig: GPTConfig): Promise<SavedGPT> {
    const savedGPTs = this.getSavedGPTs();
    
    const savedGPT: SavedGPT = {
      ...gptConfig,
      id: gptConfig.id || this.generateId(),
      created_at: gptConfig.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'You',
      usage_count: 0,
      rating: 0
    };

    // Update existing or add new
    const existingIndex = savedGPTs.findIndex(gpt => gpt.id === savedGPT.id);
    if (existingIndex >= 0) {
      savedGPTs[existingIndex] = savedGPT;
    } else {
      savedGPTs.push(savedGPT);
    }

    localStorage.setItem(STORAGE_KEYS.SAVED_GPTS, JSON.stringify(savedGPTs));
    return savedGPT;
  }

  // Get all saved GPTs
  getSavedGPTs(): SavedGPT[] {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_GPTS);
    return saved ? JSON.parse(saved) : [];
  }

  // Get GPT by ID
  getGPTById(id: string): SavedGPT | null {
    const savedGPTs = this.getSavedGPTs();
    return savedGPTs.find(gpt => gpt.id === id) || null;
  }

  // Delete GPT
  deleteGPT(id: string): boolean {
    const savedGPTs = this.getSavedGPTs();
    const filteredGPTs = savedGPTs.filter(gpt => gpt.id !== id);
    
    if (filteredGPTs.length !== savedGPTs.length) {
      localStorage.setItem(STORAGE_KEYS.SAVED_GPTS, JSON.stringify(filteredGPTs));
      return true;
    }
    return false;
  }

  // Generate shareable link
  generateShareableLink(gptId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/gpt/${gptId}`;
  }

  // Simulate API call to OpenAI (for demo purposes)
  async testGPTConfiguration(gptConfig: GPTConfig): Promise<{ success: boolean; message: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!this.apiKey) {
      return { success: false, message: 'API key not configured' };
    }

    // Basic validation
    if (!gptConfig.name.trim()) {
      return { success: false, message: 'GPT name is required' };
    }

    if (!gptConfig.instructions.trim()) {
      return { success: false, message: 'Instructions are required' };
    }

    return { success: true, message: 'GPT configuration is valid' };
  }

  // Export GPT configuration
  exportGPT(gpt: SavedGPT): void {
    const dataStr = JSON.stringify(gpt, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${gpt.name.replace(/\s+/g, '_').toLowerCase()}_gpt.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // Import GPT configuration
  async importGPT(file: File): Promise<SavedGPT> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const gptData = JSON.parse(e.target?.result as string);
          const importedGPT: SavedGPT = {
            ...gptData,
            id: this.generateId(), // Generate new ID for imported GPT
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            author: 'You (Imported)'
          };
          resolve(importedGPT);
        } catch (error) {
          reject(new Error('Invalid GPT file format'));
        }
      };
      reader.readAsText(file);
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const gptService = new GPTService();