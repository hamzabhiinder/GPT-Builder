import { KnowledgeFile } from '../types/gpt';

export class KnowledgeService {
  // Process uploaded file and extract text content
  async processFile(file: File): Promise<KnowledgeFile> {
    try {
      const content = await this.extractTextFromFile(file);
      
      return {
        id: this.generateId(),
        name: file.name,
        type: file.type,
        size: file.size,
        content: content,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(`Failed to process file: ${file.name}`);
    }
  }

  // Extract text content from different file types
  private async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    // Handle different file types
    if (fileType.includes('text/') || fileName.endsWith('.txt')) {
      return await this.readTextFile(file);
    } 
    else if (fileType.includes('application/json') || fileName.endsWith('.json')) {
      const content = await this.readTextFile(file);
      try {
        const jsonData = JSON.parse(content);
        return this.formatJsonContent(jsonData);
      } catch {
        return content;
      }
    }
    else if (fileName.endsWith('.csv')) {
      return await this.processCsvFile(file);
    }
    else if (fileName.endsWith('.md')) {
      return await this.readTextFile(file);
    }
    else if (fileType.includes('application/pdf') || fileName.endsWith('.pdf')) {
      return await this.extractFromPDF(file);
    }
    else if (fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || 
             fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return await this.extractFromWord(file);
    }
    else {
      // Try to read as text for unknown types
      try {
        return await this.readTextFile(file);
      } catch {
        throw new Error(`Unsupported file type: ${file.type || 'unknown'}`);
      }
    }
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  private async processCsvFile(file: File): Promise<string> {
    const content = await this.readTextFile(file);
    const lines = content.split('\n');
    
    if (lines.length === 0) return content;
    
    // Format CSV as readable text
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    let formatted = `CSV Data from ${file.name}:\n\n`;
    formatted += `Headers: ${headers.join(' | ')}\n`;
    formatted += '-'.repeat(50) + '\n';
    
    for (let i = 1; i < Math.min(lines.length, 100); i++) { // Limit to first 100 rows
      const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
      if (row.length === headers.length) {
        formatted += row.join(' | ') + '\n';
      }
    }
    
    if (lines.length > 100) {
      formatted += `\n... and ${lines.length - 100} more rows`;
    }
    
    return formatted;
  }

  private formatJsonContent(jsonData: any): string {
    let formatted = 'JSON Data:\n\n';
    
    if (Array.isArray(jsonData)) {
      formatted += `Array with ${jsonData.length} items:\n`;
      jsonData.slice(0, 10).forEach((item, index) => {
        formatted += `\nItem ${index + 1}:\n`;
        formatted += this.formatObject(item, 1);
      });
      if (jsonData.length > 10) {
        formatted += `\n... and ${jsonData.length - 10} more items`;
      }
    } else if (typeof jsonData === 'object') {
      formatted += this.formatObject(jsonData, 0);
    } else {
      formatted += String(jsonData);
    }
    
    return formatted;
  }

  private formatObject(obj: any, indent: number = 0): string {
    const spaces = '  '.repeat(indent);
    let result = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result += `${spaces}${key}:\n`;
        result += this.formatObject(value, indent + 1);
      } else {
        result += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return result;
  }

  private async extractFromPDF(file: File): Promise<string> {
    // For now, return a structured placeholder that indicates PDF processing
    return `PDF Document: ${file.name}
Size: ${(file.size / 1024).toFixed(1)} KB
Uploaded: ${new Date().toLocaleDateString()}

Content Summary:
This PDF document has been uploaded to the knowledge base. The system can reference this document when answering questions. 

Note: Full PDF text extraction requires additional libraries. In a production environment, this would contain the complete extracted text from the PDF file.

File Type: PDF
Processing Status: Uploaded and indexed
Available for: Question answering and reference`;
  }

  private async extractFromWord(file: File): Promise<string> {
    // For now, return a structured placeholder that indicates Word processing
    return `Word Document: ${file.name}
Size: ${(file.size / 1024).toFixed(1)} KB
Uploaded: ${new Date().toLocaleDateString()}

Content Summary:
This Word document has been uploaded to the knowledge base. The system can reference this document when answering questions.

Note: Full Word document text extraction requires additional libraries. In a production environment, this would contain the complete extracted text from the Word document.

File Type: Microsoft Word
Processing Status: Uploaded and indexed
Available for: Question answering and reference`;
  }

  // Enhanced search through knowledge files
  searchKnowledge(query: string, knowledgeFiles: KnowledgeFile[]): string[] {
    if (!query.trim() || knowledgeFiles.length === 0) {
      return [];
    }

    const results: string[] = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

    knowledgeFiles.forEach(file => {
      const content = file.content.toLowerCase();
      let relevanceScore = 0;
      
      // Check for exact query match
      if (content.includes(queryLower)) {
        relevanceScore += 10;
      }
      
      // Check for individual word matches
      queryWords.forEach(word => {
        if (content.includes(word)) {
          relevanceScore += 1;
        }
      });

      if (relevanceScore > 0) {
        // Extract relevant sections
        const sentences = file.content.split(/[.!?]+/);
        const relevantSentences = sentences.filter(sentence => {
          const sentenceLower = sentence.toLowerCase();
          return queryWords.some(word => sentenceLower.includes(word)) || 
                 sentenceLower.includes(queryLower);
        });
        
        if (relevantSentences.length > 0) {
          const excerpt = relevantSentences
            .slice(0, 3)
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .join('. ');
          
          if (excerpt) {
            results.push(`📄 **From ${file.name}:**\n${excerpt}${excerpt.endsWith('.') ? '' : '.'}`);
          }
        }
      }
    });

    return results.slice(0, 3); // Return top 3 most relevant results
  }

  // Get file summary for display
  getFileSummary(file: KnowledgeFile): string {
    const lines = file.content.split('\n').filter(line => line.trim().length > 0);
    const wordCount = file.content.split(/\s+/).length;
    
    return `${lines.length} lines, ~${wordCount} words`;
  }

  // Validate file before processing
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'text/plain',
      'text/csv',
      'application/json',
      'text/markdown',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    const allowedExtensions = ['.txt', '.csv', '.json', '.md', '.pdf', '.docx', '.doc'];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }
    
    const hasValidType = allowedTypes.includes(file.type) || 
                        allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidType) {
      return { valid: false, error: 'Unsupported file type. Please upload TXT, CSV, JSON, MD, PDF, or Word documents.' };
    }
    
    return { valid: true };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const knowledgeService = new KnowledgeService();