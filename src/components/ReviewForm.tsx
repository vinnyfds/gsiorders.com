import React, { useState } from 'react';

interface ReviewFormProps {
  productId: string;
  onSubmit?: (review: { rating: number; comment: string }) => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  productId, 
  onSubmit, 
  onCancel 
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{rating?: string; comment?: string}>({});
  const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const validateForm = () => {
    const newErrors: {rating?: string; comment?: string} = {};
    
    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (!comment.trim()) {
      newErrors.comment = 'Please write a comment';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters';
    } else if (comment.trim().length > 500) {
      newErrors.comment = 'Comment must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMessage(null);
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          rating,
          comment: comment.trim()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      const data = await response.json();
      
      // Call the optional callback
      if (onSubmit) {
        onSubmit({ rating, comment: comment.trim() });
      }

      // Reset form and show success message
      setRating(0);
      setComment('');
      setErrors({});
      setSubmitMessage({ type: 'success', message: 'Review submitted successfully! It will be visible after moderation.' });

    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitMessage({ type: 'error', message: 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: undefined }));
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    if (errors.comment && e.target.value.trim().length >= 10) {
      setErrors(prev => ({ ...prev, comment: undefined }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentRating: number) => {
    if (e.key === 'ArrowRight' && currentRating < 5) {
      e.preventDefault();
      const nextButton = document.querySelector(`[aria-label="${currentRating + 1} star${currentRating + 1 > 1 ? 's' : ''}"]`) as HTMLButtonElement;
      nextButton?.focus();
    } else if (e.key === 'ArrowLeft' && currentRating > 1) {
      e.preventDefault();
      const prevButton = document.querySelector(`[aria-label="${currentRating - 1} star${currentRating - 1 > 1 ? 's' : ''}"]`) as HTMLButtonElement;
      prevButton?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Leave a Review</h3>
      
      {/* Submit Message */}
      {submitMessage && (
        <div className={`mb-6 p-4 rounded-xl ${submitMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {submitMessage.message}
        </div>
      )}
      
      {/* Rating Section */}
      <div className="mb-6">
        <label id="rating-label" className="block text-sm font-medium text-gray-700 mb-3">
          Rating
        </label>
        
        <div role="group" aria-labelledby="rating-label" className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' && star < 5) {
                  e.preventDefault();
                  const nextButton = document.querySelector(`[aria-label="${star + 1} star${star + 1 > 1 ? 's' : ''}"]`) as HTMLButtonElement;
                  nextButton?.focus();
                } else if (e.key === 'ArrowLeft' && star > 1) {
                  e.preventDefault();
                  const prevButton = document.querySelector(`[aria-label="${star - 1} star${star - 1 > 1 ? 's' : ''}"]`) as HTMLButtonElement;
                  prevButton?.focus();
                }
              }}
              className={`
                p-1 rounded-full transition-all duration-200
                hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500
                ${rating >= star ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}
              `}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              <span className="text-2xl">
                {star <= rating ? '★' : '☆'}
              </span>
            </button>
          ))}
          
          {rating > 0 && (
            <span className="ml-3 text-sm text-gray-600">
              {rating} star{rating > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        {errors.rating && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {errors.rating}
          </p>
        )}
      </div>

      {/* Comment Section */}
      <div className="mb-6">
        <label 
          htmlFor="comment" 
          className="block text-sm font-medium text-gray-700 mb-3"
        >
          Your Review Comment *
        </label>
        
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={4}
          minLength={10}
          maxLength={500}
          disabled={isSubmitting}
          className={`
            w-full px-4 py-3 rounded-xl border shadow-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${errors.comment 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-brand-primary focus:border-brand-primary'
            }
          `}
        />
        
        <div className="flex justify-between items-center mt-2">
          {errors.comment && (
            <span className="text-sm text-red-600" role="alert">
              {errors.comment}
            </span>
          )}
          <span className="text-sm text-gray-500 ml-auto">
            {comment.length}/500
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200
            ${isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Submitting...
            </span>
          ) : (
            'Submit Review'
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm; 