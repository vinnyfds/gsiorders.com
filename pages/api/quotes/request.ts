import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service key for server-side operations
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

// TypeScript interfaces for type safety
interface QuoteItem {
  product_id: string;
  quantity: number;
  notes?: string;
}

interface QuoteRequest {
  items: QuoteItem[];
  company_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  additional_notes?: string;
}

interface QuoteResponse {
  success: boolean;
  quote_id?: string;
  message: string;
  error?: string;
}

// Defense-first validation function
const validateQuoteRequest = (body: any): QuoteRequest => {
  if (body === undefined || body === null) throw new Error('Request body is required');
  if (!('items' in body)) throw new Error('Request body is required');
  const { items } = body;
  if (!Array.isArray(items) || items.length === 0) throw new Error('At least one item is required');

  // Validate each item
  items.forEach((item: any, index: number) => {
    if (!item.product_id || typeof item.product_id !== 'string') {
      throw new Error(`Item ${index + 1}: product_id is required and must be a string`);
    }
    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
      throw new Error(`Item ${index + 1}: quantity must be a number greater than 0`);
    }
    if (item.quantity > 999) {
      throw new Error(`Item ${index + 1}: quantity cannot exceed 999`);
    }
  });

  return body as QuoteRequest;
};

// Verify products exist and are available (defense-first inventory check)
const verifyProductsExist = async (items: QuoteItem[]): Promise<void> => {
  const productIds = items.map(item => item.product_id);
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, inventory_count')
    .in('id', productIds);
  
  if (error) {
    console.error('❌ Database error verifying products:', error);
    throw new Error('Failed to verify products');
  }
  
  if (!products || products.length !== productIds.length) {
    throw new Error('One or more products not found');
  }
  
  // Check for out-of-stock products
  const outOfStockProducts = products.filter(p => p.inventory_count === 0);
  if (outOfStockProducts.length > 0) {
    const productNames = outOfStockProducts.map(p => p.name).join(', ');
    throw new Error(`The following products are out of stock: ${productNames}`);
  }
  
  console.log('✅ Products verified:', products.length, 'products found and in stock');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Method validation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed', message: 'Method not allowed' });
  }

  // Check for missing body
  if (!req.body) {
    return res.status(400).json({ error: 'validation_error', message: 'Request body is required' });
  }

  let quoteRequest;
  try {
    quoteRequest = validateQuoteRequest(req.body);
  } catch (validationError) {
    console.error('Validation error:', validationError);
    return res.status(400).json({ 
      error: 'validation_error', 
      message: validationError instanceof Error ? validationError.message : 'Invalid request body'
    });
  }

  try {
    // Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return res.status(401).json({ 
        error: 'unauthorized', 
        message: 'Authentication required' 
      });
    }

    // Fetch products
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price, inventory_count')
      .in('id', quoteRequest.items.map(i => i.product_id));

    if (productError) {
      return res.status(500).json({ error: 'internal', message: 'Database error while fetching products' });
    }
    if (!products || products.length !== quoteRequest.items.length) {
      const foundIds = products ? products.map(p => p.id) : [];
      const missing = quoteRequest.items.filter(i => !foundIds.includes(i.product_id)).map(i => i.product_id);
      return res.status(404).json({ error: 'not_found', message: `Product(s) not found: ${missing.join(', ')}` });
    }

    // Check inventory availability only if all products found
    for (const item of quoteRequest.items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) continue; // Already handled above
      if (product.inventory_count < item.quantity) {
        return res.status(409).json({ 
          error: 'out_of_stock', 
          message: `Only ${product.inventory_count} units available for ${product.name}` 
        });
      }
    }

    // Calculate total value for the quote
    const totalValue = quoteRequest.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    // Insert quote request into database
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        user_id: user.id,
        items: quoteRequest.items,
        company_name: quoteRequest.company_name,
        contact_name: quoteRequest.contact_name,
        contact_email: quoteRequest.contact_email,
        contact_phone: quoteRequest.contact_phone,
        additional_notes: quoteRequest.additional_notes,
        total_value: totalValue,
        status: 'requested'
      })
      .select()
      .single();

    if (quoteError) {
      return res.status(500).json({ error: 'internal', message: 'Database error while creating quote request' });
    }
    if (!quote) {
      return res.status(500).json({ error: 'internal', message: 'Failed to create quote request' });
    }

    // Log successful quote request for monitoring
    console.log('📋 Quote request created:', {
      quote_id: quote.id,
      user_id: user.id,
      total_value: totalValue,
      item_count: quoteRequest.items.length,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully',
      quote_id: quote.id,
      total_value: totalValue
    });

  } catch (error) {
    console.error('Unexpected error in quote request handler:', error);
    return res.status(500).json({ 
      error: 'internal', 
      message: 'An unexpected error occurred' 
    });
  }
} 