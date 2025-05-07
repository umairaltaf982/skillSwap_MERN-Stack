import { useState, useEffect } from 'react';
import { FaStar, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import reviewService from '../../services/reviews';
import ReviewItem from './ReviewItem';

interface ReviewListProps {
  freelancerId: string;
}

interface Review {
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
}

const ReviewList = ({ freelancerId }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxRating: 5,
  });
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await reviewService.getReviewsForFreelancer(
          freelancerId
        );
        console.log('Reviews response:', response);
        // Make sure we're accessing the correct property in the response
        if (response && response.data) {
          setReviews(response.data);
        } else {
          console.error('Unexpected response format:', response);
          setError('Failed to load reviews. Unexpected response format.');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
        setLoading(false);
      }
    };

    fetchReviews();
  }, [freelancerId]);

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: parseInt(value),
    });
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(
      (review) =>
        review.rating >= filters.minRating && review.rating <= filters.maxRating
    )
    .sort((a, b) => {
      if (sort === 'newest') {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sort === 'oldest') {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else if (sort === 'highest') {
        return b.rating - a.rating;
      } else if (sort === 'lowest') {
        return a.rating - b.rating;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 mb-4">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">
          No reviews yet. Be the first to leave a review!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Sort */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">
              Total Reviews: {reviews.length}
            </span>
            <div className="flex items-center ml-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`${
                    reviews.reduce((acc, review) => acc + review.rating, 0) /
                      reviews.length >=
                    star
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-gray-700">
                {(
                  reviews.reduce((acc, review) => acc + review.rating, 0) /
                  reviews.length
                ).toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleFilters}
              className="btn btn-outline btn-sm flex items-center"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
            <select
              value={sort}
              onChange={handleSortChange}
              className="form-select form-select-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="minRating"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Minimum Rating
                </label>
                <select
                  id="minRating"
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  className="form-select w-full"
                >
                  <option value="0">Any Rating</option>
                  <option value="1">1+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="maxRating"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Maximum Rating
                </label>
                <select
                  id="maxRating"
                  name="maxRating"
                  value={filters.maxRating}
                  onChange={handleFilterChange}
                  className="form-select w-full"
                >
                  <option value="5">Any Rating</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredAndSortedReviews.length > 0 ? (
          filteredAndSortedReviews.map((review) => (
            <ReviewItem key={review._id} review={review} />
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600">No reviews match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
