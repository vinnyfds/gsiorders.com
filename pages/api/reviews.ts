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
    return await createReview(req, res);
  } else if (req.method === 'GET') {
    return await getReviews(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function createReview(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { productId, rating, comment } = req.body;

    // Validate required fields
    if (!productId || !rating || !comment) {
      return res.status(400).json({ 
        error: 'Missing required fields: productId, rating, comment' 
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    // Validate comment length
    if (comment.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Comment must be at least 10 characters long' 
      });
    }

    if (comment.trim().length > 500) {
      return res.status(400).json({ 
        error: 'Comment must be less than 500 characters' 
      });
    }

    // For now, use test user ID (in production, get from auth)
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    console.log('📝 Creating review:', {
      userId,
      productId,
      rating,
      comment: comment.substring(0, 50) + '...'
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

    // Check if user already reviewed this product
    const { data: existingReview, error: existingError } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existingReview) {
      return res.status(409).json({ 
        error: 'You have already reviewed this product' 
      });
    }

    // Create the review
    const { data: newReview, error: reviewError } = await supabase
      .from('reviews')
      .insert([{
        user_id: userId,
        product_id: productId,
        rating: parseInt(rating),
        comment: comment.trim(),
        approved: false // Reviews require moderation
      }])
      .select()
      .single();

    if (reviewError) {
      console.error('❌ Error creating review:', reviewError);
      return res.status(500).json({ error: 'Failed to create review' });
    }

    console.log('✅ Review created successfully:', newReview.id);

    res.status(201).json({
      success: true,
      review: {
        id: newReview.id,
        rating: newReview.rating,
        comment: newReview.comment,
        created_at: newReview.created_at,
        approved: newReview.approved
      },
      message: 'Review submitted successfully! It will be visible after moderation.'
    });

  } catch (error) {
    console.error('❌ Error in createReview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getReviews(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { productId, page = '1', limit = '10' } = req.query;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const offset = (pageNum - 1) * limitNum;

    console.log('📋 Fetching reviews for product:', productId, 'page:', pageNum);

    // Get approved reviews only for the product
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        users (
          email
        )
      `)
      .eq('product_id', productId)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (reviewsError) {
      console.error('❌ Error fetching reviews:', reviewsError);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('approved', true);

    if (countError) {
      console.error('❌ Error counting reviews:', countError);
      return res.status(500).json({ error: 'Failed to count reviews' });
    }

    // Calculate average rating
    const { data: ratingData, error: ratingError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('approved', true);

    let averageRating = 0;
    if (ratingData && ratingData.length > 0) {
      const total = ratingData.reduce((sum, review) => sum + review.rating, 0);
      averageRating = total / ratingData.length;
    }

    console.log('✅ Found', reviews?.length || 0, 'reviews');

    res.status(200).json({
      reviews: reviews || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      },
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: count || 0
    });

  } catch (error) {
    console.error('❌ Error in getReviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 