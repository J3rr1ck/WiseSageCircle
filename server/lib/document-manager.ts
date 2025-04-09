import * as fs from 'fs';
import * as path from 'path';
import { DocumentSearch } from './docsearch';

export class DocumentManager {
  private docSearch: DocumentSearch;
  private documentsDir: string;

  constructor(apiKey: string) {
    this.docSearch = new DocumentSearch(apiKey);
    this.documentsDir = path.join(process.cwd(), 'documents');
    this.ensureDocumentsDir();
  }

  private ensureDocumentsDir() {
    if (!fs.existsSync(this.documentsDir)) {
      fs.mkdirSync(this.documentsDir, { recursive: true });
    }
  }

  async loadDocument(filePath: string): Promise<void> {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf') {
      await this.docSearch.processPDF(filePath);
    } else if (ext === '.epub') {
      await this.docSearch.processEPUB(filePath);
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  async loadAllDocuments(): Promise<void> {
    const files = await fs.promises.readdir(this.documentsDir);
    
    for (const file of files) {
      const filePath = path.join(this.documentsDir, file);
      const stats = await fs.promises.stat(filePath);
      
      if (stats.isFile()) {
        try {
          await this.loadDocument(filePath);
          console.log(`Loaded document: ${file}`);
        } catch (error) {
          console.error(`Error loading document ${file}:`, error);
        }
      }
    }
  }

  async search(query: string, topK: number = 3) {
    return this.docSearch.search(query, topK);
  }
} 