import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import reviewService from '../../services/reviews';

interface ReviewFormProps {
  freelancerId: string;
  projectId?: string; // Optional - can be provided when coming from a project
  onReviewSubmitted: () => void;
}

const ReviewForm = ({
  freelancerId,
  projectId,
  onReviewSubmitted,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a title for your review.');
      return;
    }

    if (!comment.trim()) {
      setError('Please provide a comment.');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Submitting review:', {
        freelancer: freelancerId,
        project: projectId,
        rating,
        title,
        comment,
      });

      await reviewService.createReview({
        freelancer: freelancerId,
        project: projectId,
        rating,
        title,
        comment,
      });

      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setError(null);

      // Notify parent component that review was submitted
      onReviewSubmitted();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-2xl px-1 focus:outline-none"
              >
                <FaStar
                  className={`${
                    (hoveredRating ? hoveredRating >= star : rating >= star)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Title */}
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Review Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input w-full"
            placeholder="Summarize your experience in a few words..."
          />
        </div>

        {/* Review Text */}
        <div className="mb-4">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Review
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-textarea w-full"
            placeholder="Share your experience working with this freelancer..."
          />
        </div>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary w-full"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
