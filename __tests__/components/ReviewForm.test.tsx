import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewForm from '../../src/components/ReviewForm';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('ReviewForm', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  // UNIT TESTS: As required by testing rules
  describe('Unit Tests', () => {
    it('renders 1-5 star rating system', () => {
      render(<ReviewForm productId="test-product" />);
      
      expect(screen.getByText('Rating')).toBeInTheDocument();
      
      // Should have 5 star buttons
      const starButtons = screen.getAllByRole('button', { name: /star/i });
      expect(starButtons).toHaveLength(5);
    });

    it('star rating selection works', () => {
      render(<ReviewForm productId="test-product" />);
      
      const thirdStar = screen.getByLabelText('3 stars');
      fireEvent.click(thirdStar);
      
      // Should show 3 filled stars
      expect(screen.getAllByText('★')).toHaveLength(3);
      expect(screen.getAllByText('☆')).toHaveLength(2);
    });

    it('comment textarea with validation', () => {
      render(<ReviewForm productId="test-product" />);
      
      const textarea = screen.getByPlaceholderText('Share your thoughts about this product...');
      expect(textarea).toBeInTheDocument();
      
      // Test character counter
      fireEvent.change(textarea, { target: { value: 'Short' } });
      expect(screen.getByText('5/500')).toBeInTheDocument();
    });

    it('form validation works correctly', async () => {
      render(<ReviewForm productId="test-product" />);
      
      const submitButton = screen.getByText('Submit Review');
      fireEvent.click(submitButton);
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('Please select a rating')).toBeInTheDocument();
      });
      
      // Add rating but insufficient comment
      const firstStar = screen.getByLabelText('1 star');
      fireEvent.click(firstStar);
      
      const textarea = screen.getByPlaceholderText('Share your thoughts about this product...');
      fireEvent.change(textarea, { target: { value: 'Short' } });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Comment must be at least 10 characters')).toBeInTheDocument();
      });
    });

    it('submits to /api/reviews POST endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<ReviewForm productId="test-product" />);
      
      // Fill form
      const fourthStar = screen.getByLabelText('4 stars');
      fireEvent.click(fourthStar);
      
      const textarea = screen.getByPlaceholderText('Share your thoughts about this product...');
      fireEvent.change(textarea, { target: { value: 'Great product, really enjoyed it!' } });
      
      const submitButton = screen.getByText('Submit Review');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: 'test-product',
            rating: 4,
            comment: 'Great product, really enjoyed it!'
          })
        });
      });
    });

    it('loading state disables form', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<ReviewForm productId="test-product" />);
      
      // Fill form
      const fourthStar = screen.getByLabelText('4 stars');
      fireEvent.click(fourthStar);
      
      const textarea = screen.getByPlaceholderText('Share your thoughts about this product...');
      fireEvent.change(textarea, { target: { value: 'Great product, really enjoyed it!' } });
      
      const submitButton = screen.getByText('Submit Review');
      fireEvent.click(submitButton);
      
      // Form should be disabled during submission
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(textarea).toBeDisabled();
      });
    });

    it('error handling displays feedback', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(<ReviewForm productId="test-product" />);
      
      // Fill form
      const fourthStar = screen.getByLabelText('4 stars');
      fireEvent.click(fourthStar);
      
      const textarea = screen.getByPlaceholderText('Share your thoughts about this product...');
      fireEvent.change(textarea, { target: { value: 'Great product, really enjoyed it!' } });
      
      const submitButton = screen.getByText('Submit Review');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to submit review. Please try again.')).toBeInTheDocument();
      });
    });
  });

  // FORM VALIDATION TESTS: As required by testing rules
  describe('Form Validation Tests', () => {
    it('validates rating is required', async () => {
      render(<ReviewForm productId="test-product" />);
      
      const textarea = screen.getByPlaceholderText('Share your thoughts about this product...');
      fireEvent.change(textarea, { target: { value: 'This is a good product with more than 10 characters' } });
      
      const submitButton = screen.getByText('Submit Review');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please select a rating')).toBeInTheDocument();
      });
    });

    it('validates comment minimum length', async () => {
      render(<ReviewForm productId="test-product" />);
      
      const fourthStar = screen.getByLabelText('4 stars');
      fireEvent.click(fourthStar);
      
      const textarea = screen.getByPlaceholderText('Share your thoughts about this product...');
      fireEvent.change(textarea, { target: { value: 'Short' } });
      
      const submitButton = screen.getByText('Submit Review');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Comment must be at least 10 characters')).toBeInTheDocument();
      });
    });

    it('validates comment maximum length', async () => {
      render(<ReviewForm productId="test-product" />);
      
      const textarea = screen.getByPlaceholderText('Share your thoughts about this product...');
      const longComment = 'a'.repeat(501);
      fireEvent.change(textarea, { target: { value: longComment } });
      
      const submitButton = screen.getByText('Submit Review');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Comment must be less than 500 characters')).toBeInTheDocument();
      });
    });

    it('clears validation errors when fields are corrected', async () => {
      render(<ReviewForm productId="test-product" />);
      
      const submitButton = screen.getByText('Submit Review');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please select a rating')).toBeInTheDocument();
      });
      
      // Fix the error
      const fourthStar = screen.getByLabelText('4 stars');
      fireEvent.click(fourthStar);
      
      // Error should be cleared
      expect(screen.queryByText('Please select a rating')).not.toBeInTheDocument();
    });
  });

  // ACCESSIBILITY TESTS: As required by testing rules
  describe('Accessibility Tests', () => {
    it('has proper ARIA labels and roles', () => {
      render(<ReviewForm productId="test-product" />);
      
      expect(screen.getByRole('group', { name: /rating/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /comment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<ReviewForm productId="test-product" />);
      
      const firstStar = screen.getByLabelText('1 star');
      firstStar.focus();
      expect(firstStar).toHaveFocus();
      
      // Test Arrow key navigation
      fireEvent.keyDown(firstStar, { key: 'ArrowRight' });
      expect(screen.getByLabelText('2 stars')).toHaveFocus();
    });

    it('has proper focus indicators', () => {
      render(<ReviewForm productId="test-product" />);
      
      const textarea = screen.getByPlaceholderText('Share your thoughts about this product...');
      expect(textarea).toHaveClass('focus:ring-2', 'focus:ring-brand-primary');
    });
  });

  // CALLBACK TESTS: As required by testing rules
  describe('Callback Tests', () => {
    it('calls onSubmit callback when provided', async () => {
      const mockOnSubmit = jest.fn();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<ReviewForm productId="test-product" onSubmit={mockOnSubmit} />);
      
      // Fill form
      const fourthStar = screen.getByLabelText('4 stars');
      fireEvent.click(fourthStar);
      
      const textarea = screen.getByPlaceholderText('Share your thoughts about this product...');
      fireEvent.change(textarea, { target: { value: 'Great product, really enjoyed it!' } });
      
      const submitButton = screen.getByText('Submit Review');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          rating: 4,
          comment: 'Great product, really enjoyed it!'
        });
      });
    });

    it('calls onCancel callback when provided', () => {
      const mockOnCancel = jest.fn();
      
      render(<ReviewForm productId="test-product" onCancel={mockOnCancel} />);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
}); 