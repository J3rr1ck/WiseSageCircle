# WiseSageCircle

A spiritual guidance platform that connects users with AI-powered sages and spiritual masters.

## Document Search Functionality

The platform now includes document search functionality that allows the sages to reference spiritual texts when providing guidance. This enhances their responses with relevant quotes and insights from various spiritual works.

### Supported Document Types

- PDF files (.pdf)
- EPUB files (.epub)

### How to Add Documents

1. Place your spiritual texts in the `documents` directory at the root of the project
2. The documents will be automatically loaded when the server starts
3. The sages will use these documents to provide more informed and contextual responses

### Document Processing

Documents are processed as follows:
- Text is extracted from PDFs and EPUBs
- Content is split into manageable chunks
- Chunks are embedded using Gemini's embedding model
- When a user asks a question, relevant chunks are retrieved and included in the sage's context

### Adding New Documents

Simply add your PDF or EPUB files to the `documents` directory. The server will automatically process them on startup. You don't need to restart the server for new documents to be recognized - just add them to the directory and they'll be processed on the next server start.

### Best Practices

1. Use high-quality PDFs and EPUBs with clear text (not scanned images)
2. Keep document sizes reasonable (under 100MB per file)
3. Focus on spiritual and philosophical texts that align with the sages' traditions
4. Include a variety of perspectives and traditions for more diverse insights

## Development

### Prerequisites

- Node.js 18.18.0 or later
- A Gemini API key (set as GEMINI_API_KEY environment variable)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   ```bash
   export GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## License

MIT 