import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service key for API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

interface QuoteRequest {
  items: Array<{
    productId: string;
    quantity: number;
    notes?: string;
  }>;
  companyName?: string;
  contactEmail?: string;
  specialRequirements?: string;
}

interface QuoteResponse {
  id: string;
  status: 'requested';
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QuoteResponse | { error: string; details?: string }>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const { items, companyName, contactEmail, specialRequirements }: QuoteRequest = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: 'items array is required and must not be empty' 
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || typeof item.productId !== 'string') {
        return res.status(400).json({ 
          error: 'Invalid request', 
          details: 'Each item must have a valid productId' 
        });
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({ 
          error: 'Invalid request', 
          details: 'Each item must have a valid quantity greater than 0' 
        });
      }
    }

    // For now, use a test user ID (in production, this would come from authentication)
    const testUserId = '123e4567-e89b-12d3-a456-426614174000';

    // Prepare quote data
    const quoteData = {
      user_id: testUserId,
      items: {
        items,
        companyName,
        contactEmail,
        specialRequirements,
        submittedAt: new Date().toISOString()
      },
      status: 'requested' as const
    };

    // Insert quote into database
    const { data: quote, error } = await supabase
      .from('quotes')
      .insert(quoteData)
      .select('id, status')
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Failed to create quote request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Log the quote request for admin review
    console.log('📋 B2B Quote Request:', {
      quoteId: quote.id,
      userId: testUserId,
      itemCount: items.length,
      companyName,
      contactEmail,
      timestamp: new Date().toISOString()
    });

    // Return success response
    const response: QuoteResponse = {
      id: quote.id,
      status: quote.status,
      message: 'Quote request submitted successfully. Our team will review and contact you soon.'
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Quote request error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 