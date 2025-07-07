import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Types for better TypeScript support
interface ChatbotRequest {
  brand?: string;
  pageContext?: string;
  userQuestion: string;
}

interface ChatbotResponse {
  response: string;
  brand: string;
  timestamp: string;
}

interface ChatbotError {
  error: string;
  details?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Brand-specific system prompts
const getBrandPrompt = (brand: string): string => {
  const brandPrompts: Record<string, string> = {
    liquidheaven: `You are a helpful customer service assistant for Liquid Heaven, a premium wellness and CBD products brand. 
    You help customers with product recommendations, usage questions, and general wellness advice. 
    Be knowledgeable about CBD benefits, wellness practices, and Liquid Heaven's product line.`,
    
    motaquila: `You are a helpful customer service assistant for Motaquila, a premium beverage brand. 
    You help customers with product recommendations, cocktail recipes, and beverage-related questions. 
    Be knowledgeable about premium spirits, mixology, and Motaquila's product offerings.`,
    
    lastgenie: `You are a helpful customer service assistant for Last Genie, a specialty products brand. 
    You help customers with product recommendations, usage instructions, and general inquiries. 
    Be knowledgeable about Last Genie's unique product line and customer needs.`
  };
  
  return brandPrompts[brand] || brandPrompts.liquidheaven; // Default to Liquid Heaven
};

// Input validation
const validateRequest = (body: any): { isValid: boolean; error?: string } => {
  if (!body.userQuestion || typeof body.userQuestion !== 'string') {
    return { isValid: false, error: 'userQuestion is required and must be a string' };
  }
  
  if (body.userQuestion.trim().length === 0) {
    return { isValid: false, error: 'userQuestion cannot be empty' };
  }
  
  if (body.userQuestion.length > 1000) {
    return { isValid: false, error: 'userQuestion must be 1000 characters or less' };
  }
  
  if (body.brand && typeof body.brand !== 'string') {
    return { isValid: false, error: 'brand must be a string' };
  }
  
  if (body.pageContext && typeof body.pageContext !== 'string') {
    return { isValid: false, error: 'pageContext type must be a string' };
  }
  
  return { isValid: true };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatbotResponse | ChatbotError>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured');
      return res.status(500).json({ 
        error: 'Chatbot service not configured',
        details: 'OpenAI API key missing'
      });
    }

    // Parse and validate request body
    const { brand = 'liquidheaven', pageContext, userQuestion }: ChatbotRequest = req.body;
    
    const validation = validateRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid request',
        details: validation.error
      });
    }

    console.log(`🤖 Chatbot request: Brand: ${brand}, Question: "${userQuestion.substring(0, 50)}..."`);

    // Build system prompt with context
    let systemPrompt = getBrandPrompt(brand);
    
    if (pageContext) {
      systemPrompt += `\n\nCurrent page context: ${pageContext}`;
    }
    
    systemPrompt += `\n\nPlease provide helpful, accurate, and friendly responses. If you don't know something, say so rather than making up information.`;

    // Check if streaming is requested
    const shouldStream = req.headers.accept?.includes('text/event-stream');

    if (shouldStream) {
      // Set up streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      // Create streaming completion
      const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userQuestion
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: true
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content, timestamp: new Date().toISOString() })}\n\n`);
        }
      }

      // Send end marker
      res.write(`data: ${JSON.stringify({ done: true, fullResponse, brand, timestamp: new Date().toISOString() })}\n\n`);
      res.end();

      console.log(`✅ Chatbot streaming response completed for ${brand}`);
    } else {
      // Non-streaming response
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userQuestion
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';

      console.log(`✅ Chatbot response generated for ${brand}`);

      // Return response
      const chatbotResponse: ChatbotResponse = {
        response,
        brand,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(chatbotResponse);
    }

  } catch (error: any) {
    console.error('❌ Chatbot API error:', error);

    // Handle specific OpenAI errors
    if (error?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        details: 'Please try again in a few moments'
      });
    }

    if (error?.status === 401) {
      return res.status(500).json({ 
        error: 'Authentication error',
        details: 'OpenAI API key may be invalid'
      });
    }

    if (error?.status === 400) {
      return res.status(400).json({ 
        error: 'Invalid request to AI service',
        details: error.message
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Failed to process chatbot request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Export types for frontend use
export type { ChatbotRequest, ChatbotResponse, ChatbotError }; 