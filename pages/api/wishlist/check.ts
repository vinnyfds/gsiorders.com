import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId } = req.query;

    // Validate required fields
    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // For development, use test user ID
    // In production, this would come from authentication
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    // Check if product is in wishlist
    const { data: existingItem, error } = await supabase
      .from('wishlist_items')
      .select('user_id, product_id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking wishlist:', error);
      return res.status(500).json({ error: 'Failed to check wishlist' });
    }

    const isSaved = !!existingItem;

    return res.status(200).json({ 
      isSaved,
      success: true
    });

  } catch (error: any) {
    console.error('Wishlist check API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 