import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';
import * as epub from 'epub-parse';

interface DocumentChunk {
  content: string;
  metadata: {
    source: string;
    page?: number;
    chapter?: string;
  };
}

export class DocumentSearch {
  private genAI: GoogleGenAI;
  private chunks: DocumentChunk[] = [];
  private embeddingModel = 'embedding-001';

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async processPDF(filePath: string): Promise<void> {
    const pdfBytes = await fs.promises.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numPages = pdfDoc.getPageCount();

    for (let i = 0; i < numPages; i++) {
      const page = pdfDoc.getPage(i);
      const text = await page.getText();
      
      // Split text into chunks of roughly 1000 characters
      const chunks = this.splitIntoChunks(text, 1000);
      
      chunks.forEach(chunk => {
        this.chunks.push({
          content: chunk,
          metadata: {
            source: path.basename(filePath),
            page: i + 1
          }
        });
      });
    }
  }

  async processEPUB(filePath: string): Promise<void> {
    const epubDoc = await epub.parse(filePath);
    
    for (const chapter of epubDoc.chapters) {
      const text = chapter.content;
      const chunks = this.splitIntoChunks(text, 1000);
      
      chunks.forEach(chunk => {
        this.chunks.push({
          content: chunk,
          metadata: {
            source: path.basename(filePath),
            chapter: chapter.title
          }
        });
      });
    }
  }

  private splitIntoChunks(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';
    
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
      }
      currentChunk += sentence + '. ';
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  async search(query: string, topK: number = 3): Promise<DocumentChunk[]> {
    // Get query embedding
    const queryEmbedding = await this.getEmbedding(query);
    
    // Get embeddings for all chunks
    const chunkEmbeddings = await Promise.all(
      this.chunks.map(chunk => this.getEmbedding(chunk.content))
    );
    
    // Calculate cosine similarity and sort chunks
    const similarities = chunkEmbeddings.map((embedding, index) => ({
      similarity: this.cosineSimilarity(queryEmbedding, embedding),
      chunk: this.chunks[index]
    }));
    
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return similarities.slice(0, topK).map(item => item.chunk);
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const result = await this.genAI.models.embedContent({
      model: this.embeddingModel,
      contents: text,
    });
    
    if (!result.embeddings?.[0]?.values) {
      throw new Error('Failed to get embedding from Gemini API');
    }
    
    return result.embeddings[0].values;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
} 