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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    return await toggleWishlist(req, res);
  } else if (req.method === 'GET') {
    return await getUserWishlist(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function toggleWishlist(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { productId, action } = req.body;

    // Validate required fields
    if (!productId || !action) {
      return res.status(400).json({ 
        error: 'Missing required fields: productId, action' 
      });
    }

    // Validate action
    if (action !== 'add' && action !== 'remove') {
      return res.status(400).json({ 
        error: 'Action must be either "add" or "remove"' 
      });
    }

    // For now, use test user ID (in production, get from auth)
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    console.log('💝 Toggling wishlist:', {
      userId,
      productId,
      action
    });

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check current wishlist status
    const { data: existingItem, error: existingError } = await supabase
      .from('wishlist_items')
      .select('user_id, product_id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    const isCurrentlyInWishlist = !!existingItem;

    if (action === 'add') {
      if (isCurrentlyInWishlist) {
        return res.status(409).json({ 
          error: 'Product is already in wishlist',
          isSaved: true 
        });
      }

      // Add to wishlist
      const { error: insertError } = await supabase
        .from('wishlist_items')
        .insert([{
          user_id: userId,
          product_id: productId
        }]);

      if (insertError) {
        console.error('❌ Error adding to wishlist:', insertError);
        return res.status(500).json({ error: 'Failed to add to wishlist' });
      }

      console.log('✅ Added to wishlist:', product.name);

      res.status(201).json({
        success: true,
        isSaved: true,
        message: `Added "${product.name}" to wishlist`
      });

    } else { // action === 'remove'
      if (!isCurrentlyInWishlist) {
        return res.status(404).json({ 
          error: 'Product is not in wishlist',
          isSaved: false 
        });
      }

      // Remove from wishlist
      const { error: deleteError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (deleteError) {
        console.error('❌ Error removing from wishlist:', deleteError);
        return res.status(500).json({ error: 'Failed to remove from wishlist' });
      }

      console.log('✅ Removed from wishlist:', product.name);

      res.status(200).json({
        success: true,
        isSaved: false,
        message: `Removed "${product.name}" from wishlist`
      });
    }

  } catch (error) {
    console.error('❌ Error in toggleWishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUserWishlist(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = '1', limit = '20' } = req.query;

    // For now, use test user ID (in production, get from auth)
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    console.log('📋 Fetching wishlist for user:', userId, 'page:', pageNum);

    // Get wishlist items with product details
    const { data: wishlistItems, error: wishlistError } = await supabase
      .from('wishlist_items')
      .select(`
        product_id,
        products (
          id,
          name,
          price,
          images,
          inventory_count,
          brands (
            name,
            slug
          )
        )
      `)
      .eq('user_id', userId)
      .range(offset, offset + limitNum - 1);

    if (wishlistError) {
      console.error('❌ Error fetching wishlist:', wishlistError);
      return res.status(500).json({ error: 'Failed to fetch wishlist' });
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('wishlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('❌ Error counting wishlist items:', countError);
      return res.status(500).json({ error: 'Failed to count wishlist items' });
    }

    // Transform the data to match expected format
    const transformedItems = wishlistItems?.map(item => ({
      product_id: item.product_id,
      product: item.products
    })) || [];

    console.log('✅ Found', transformedItems.length, 'wishlist items');

    res.status(200).json({
      wishlist: transformedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      },
      totalItems: count || 0
    });

  } catch (error) {
    console.error('❌ Error in getUserWishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 