export interface GPTConfig {
  id?: string;
  name: string;
  description: string;
  instructions: string;
  conversation_starters: string[];
  knowledge_files: File[];
  capabilities: {
    web_search: boolean;
    canvas: boolean;
    dalle_image_generation: boolean;
    code_interpreter: boolean;
  };
  custom_actions: Array<{
    id?: string;
    name: string;
    endpoint: string;
    parameters: string;
    explanation: string;
  }>;
  visibility: 'private' | 'link' | 'public';
  created_at?: string;
  updated_at?: string;
  author?: string;
}

export interface SavedGPT extends GPTConfig {
  id: string;
  created_at: string;
  updated_at: string;
  author: string;
  usage_count?: number;
  rating?: number;
}