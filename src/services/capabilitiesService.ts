import { SavedGPT } from '../types/gpt';

export class CapabilitiesService {
  // Web Search capability
  async performWebSearch(query: string): Promise<string> {
    // Demo web search results
    const searchResults = [
      {
        title: "Search Result 1",
        snippet: `Information about "${query}" from web search. This would contain relevant information found on the internet.`,
        url: "https://example.com/result1"
      },
      {
        title: "Search Result 2", 
        snippet: `Additional details about "${query}" from another source. Web search provides current information.`,
        url: "https://example.com/result2"
      }
    ];

    return `🔍 **Web Search Results for "${query}":**\n\n` +
           searchResults.map(result => 
             `**${result.title}**\n${result.snippet}\nSource: ${result.url}`
           ).join('\n\n');
  }

  // DALL-E Image Generation capability
  async generateImage(prompt: string): Promise<string> {
    // Demo image generation
    return `🎨 **Image Generated for:** "${prompt}"\n\n` +
           `[Generated Image Placeholder]\n\n` +
           `I would generate an image based on your prompt "${prompt}". ` +
           `In a real implementation with OpenAI API, this would create an actual image using DALL-E.`;
  }

  // Code Interpreter capability
  async executeCode(code: string, language: string = 'python'): Promise<string> {
    // Demo code execution
    return `💻 **Code Execution (${language}):**\n\n` +
           `\`\`\`${language}\n${code}\n\`\`\`\n\n` +
           `**Output:**\n` +
           `This is a demo output. In a real implementation, this code would be executed safely and return actual results.`;
  }

  // Canvas capability
  async createCanvas(content: string): Promise<string> {
    return `🎨 **Canvas Created:**\n\n` +
           `I've created a canvas with the following content:\n"${content}"\n\n` +
           `In a real implementation, this would open an interactive canvas where you can collaborate on visual content.`;
  }

  // Check if capability should be used based on user message
  shouldUseWebSearch(message: string): boolean {
    const webSearchKeywords = ['search', 'find', 'latest', 'current', 'news', 'recent', 'what is', 'who is', 'when did', 'where is'];
    return webSearchKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  shouldGenerateImage(message: string): boolean {
    const imageKeywords = ['image', 'picture', 'draw', 'create', 'generate', 'show me', 'visualize', 'illustration'];
    return imageKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  shouldExecuteCode(message: string): boolean {
    const codeKeywords = ['code', 'python', 'javascript', 'calculate', 'compute', 'run', 'execute', 'script'];
    return codeKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  shouldUseCanvas(message: string): boolean {
    const canvasKeywords = ['canvas', 'collaborate', 'visual', 'diagram', 'chart', 'design'];
    return canvasKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }
}

export const capabilitiesService = new CapabilitiesService();