import type { NextApiRequest, NextApiResponse } from 'next';

interface TaxCalculationRequest {
  subtotal: number;
  state?: string;
  zipCode?: string;
}

interface TaxCalculationResponse {
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
  state: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subtotal, state = 'FL', zipCode }: TaxCalculationRequest = req.body;

    // Validate input
    if (!subtotal || subtotal <= 0) {
      return res.status(400).json({ 
        error: 'Invalid subtotal. Must be a positive number.' 
      });
    }

    if (typeof subtotal !== 'number') {
      return res.status(400).json({ 
        error: 'Subtotal must be a number.' 
      });
    }

    // Calculate tax rate based on state (MVP: flat rate, future: integrate with Stripe Tax)
    const getTaxRate = (stateCode: string): number => {
      const taxRates: Record<string, number> = {
        'FL': 0.07, // Florida sales tax
        'CA': 0.085, // California (example)
        'NY': 0.08, // New York (example)
        'TX': 0.0625, // Texas (example)
      };
      
      return taxRates[stateCode.toUpperCase()] || 0.07; // Default to FL rate
    };

    const taxRate = getTaxRate(state);
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100; // Round to 2 decimal places
    const total = subtotal + taxAmount;

    console.log(`💰 Tax calculation: $${subtotal} subtotal + $${taxAmount} tax (${(taxRate * 100).toFixed(1)}%) = $${total} total`);

    const response: TaxCalculationResponse = {
      subtotal,
      taxAmount,
      total,
      taxRate,
      state: state.toUpperCase()
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ Tax calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate tax',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 