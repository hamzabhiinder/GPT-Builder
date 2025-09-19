import { KnowledgeFile } from '../types/gpt';

export class KnowledgeService {
  // Process uploaded file and extract text content
  async processFile(file: File): Promise<KnowledgeFile> {
    const content = await this.extractTextFromFile(file);
    
    return {
      id: this.generateId(),
      name: file.name,
      type: file.type,
      size: file.size,
      content: content,
      uploadedAt: new Date().toISOString()
    };
  }

  // Extract text content from different file types
  private async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type.toLowerCase();
    
    if (fileType.includes('text/') || fileType.includes('application/json')) {
      return await this.readTextFile(file);
    } else if (fileType.includes('application/pdf')) {
      return await this.extractFromPDF(file);
    } else if (fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || 
               fileType.includes('application/msword')) {
      return await this.extractFromWord(file);
    } else if (fileType.includes('text/csv') || fileType.includes('application/vnd.ms-excel')) {
      return await this.readTextFile(file);
    } else {
      // Try to read as text for unknown types
      return await this.readTextFile(file);
    }
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private async extractFromPDF(file: File): Promise<string> {
    // For demo purposes, return a placeholder
    // In a real implementation, you'd use a PDF parsing library
    return `[PDF Content from ${file.name}]\n\nThis is a placeholder for PDF content extraction. In a real implementation, this would contain the actual text extracted from the PDF file.`;
  }

  private async extractFromWord(file: File): Promise<string> {
    // For demo purposes, return a placeholder
    // In a real implementation, you'd use a Word document parsing library
    return `[Word Document Content from ${file.name}]\n\nThis is a placeholder for Word document content extraction. In a real implementation, this would contain the actual text extracted from the Word document.`;
  }

  // Search through knowledge files for relevant content
  searchKnowledge(query: string, knowledgeFiles: KnowledgeFile[]): string[] {
    const results: string[] = [];
    const queryLower = query.toLowerCase();

    knowledgeFiles.forEach(file => {
      const content = file.content.toLowerCase();
      if (content.includes(queryLower)) {
        // Extract relevant paragraphs
        const sentences = file.content.split(/[.!?]+/);
        const relevantSentences = sentences.filter(sentence => 
          sentence.toLowerCase().includes(queryLower)
        );
        
        if (relevantSentences.length > 0) {
          results.push(`From ${file.name}:\n${relevantSentences.slice(0, 3).join('. ')}.`);
        }
      }
    });

    return results;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const knowledgeService = new KnowledgeService();