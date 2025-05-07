import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaReply } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';
import reviewService from '../../services/reviews';

interface ReviewItemProps {
  review: {
    _id: string;
    rating: number;
    comment: string;
    client: {
      _id: string;
      name: string;
    };
    freelancer: string;
    project: string;
    createdAt: string;
    response?: {
      comment: string;
      createdAt: string;
    };
  };
}

const ReviewItem = ({ review }: ReviewItemProps) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewWithResponse, setReviewWithResponse] = useState(review);

  const { user } = useContext(AuthContext);

  // Check if the current user is the freelancer who received this review
  const isReviewedFreelancer = user && user._id === review.freelancer;

  // Render stars for rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  // Handle response submission
  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    try {
      setSubmitting(true);
      const response = await reviewService.respondToReview(
        review._id,
        responseText
      );
      setReviewWithResponse({
        ...reviewWithResponse,
        response: {
          comment: responseText,
          createdAt: new Date().toISOString(),
        },
      });
      setShowResponseForm(false);
      setResponseText('');
      setError(null);
    } catch (err) {
      console.error('Error submitting response:', err);
      setError('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      {/* Review Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold mr-3">
            {review.client && review.client.name ? review.client.name[0] : '?'}
          </div>
          <div>
            <div className="font-medium">
              {review.client && review.client.name
                ? review.client.name
                : 'Anonymous'}
            </div>
            <div className="text-sm text-gray-500">
              {review.createdAt ? formatDate(review.createdAt) : 'Unknown date'}
            </div>
          </div>
        </div>
        {renderStars(review.rating || 0)}
      </div>

      {/* Review Comment */}
      <div className="mb-4">
        <p className="text-gray-700">{review.comment}</p>
      </div>

      {/* Freelancer Response */}
      {reviewWithResponse.response && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <FaReply className="text-gray-400 mr-2" />
              <div className="font-medium">Freelancer Response</div>
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(reviewWithResponse.response.createdAt)}
            </div>
          </div>
          <p className="text-gray-700">{reviewWithResponse.response.comment}</p>
        </div>
      )}

      {/* Response Form for Freelancers */}
      {isReviewedFreelancer && !reviewWithResponse.response && (
        <div className="mt-4">
          {!showResponseForm ? (
            <button
              onClick={() => setShowResponseForm(true)}
              className="text-primary-600 hover:text-primary-800 font-medium flex items-center"
            >
              <FaReply className="mr-2" />
              Respond to this review
            </button>
          ) : (
            <form onSubmit={handleSubmitResponse}>
              <label
                htmlFor="response"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Response
              </label>
              <textarea
                id="response"
                rows={3}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="form-textarea w-full mb-2"
                placeholder="Write your response to this review..."
              />
              {error && (
                <div className="text-red-600 text-sm mb-2">{error}</div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResponseForm(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
