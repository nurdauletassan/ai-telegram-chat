import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('API Key length:', apiKey?.length); // Log length instead of actual key for security

    if (!apiKey) {
      throw new Error('Gemini API key is not defined in environment variables');
    }

    try {
      // Initialize the Gemini API with your API key
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 100, // Reduced token limit for shorter responses
        },
      });
    } catch (error) {
      console.error('Error initializing Gemini:', error);
      throw new Error('Failed to initialize Gemini API');
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      console.log('Sending prompt to Gemini:', prompt);
      const result = await this.model.generateContent({
        contents: [{ 
          role: 'user', 
          parts: [{ 
            text: `Please provide a brief response in 2-3 sentences: ${prompt}` 
          }] 
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 100, // Reduced token limit for shorter responses
        },
      });
      const response = await result.response;
      return response.text();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Detailed error:', {
          message: error.message,
          name: error.name
        });
      }
      return 'Sorry, I encountered an error while processing your request.';
    }
  }
}

export const geminiService = new GeminiService(); 