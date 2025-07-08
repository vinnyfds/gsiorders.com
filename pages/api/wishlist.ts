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
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, action } = req.body;

    // Validate required fields
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (!action || !['add', 'remove'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // For development, use test user ID
    // In production, this would come from authentication
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    // Verify product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (action === 'add') {
      // Check if already in wishlist
      const { data: existingItem, error: checkError } = await supabase
        .from('wishlist_items')
        .select('user_id, product_id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking wishlist:', checkError);
        return res.status(500).json({ error: 'Failed to check wishlist' });
      }

      if (existingItem) {
        return res.status(409).json({ error: 'Already in wishlist' });
      }

      // Add to wishlist
      const { error: insertError } = await supabase
        .from('wishlist_items')
        .insert([{ user_id: userId, product_id: productId }]);

      if (insertError) {
        console.error('Error adding to wishlist:', insertError);
        return res.status(500).json({ error: 'Failed to add to wishlist' });
      }

      console.log(`✅ Added to wishlist: ${productId} for user: ${userId}`);
      return res.status(200).json({ success: true });

    } else if (action === 'remove') {
      // Remove from wishlist
      const { error: deleteError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (deleteError) {
        console.error('Error removing from wishlist:', deleteError);
        return res.status(500).json({ error: 'Failed to remove from wishlist' });
      }

      console.log(`🗑️ Removed from wishlist: ${productId} for user: ${userId}`);
      return res.status(200).json({ success: true });
    }

  } catch (error: any) {
    console.error('Wishlist API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 