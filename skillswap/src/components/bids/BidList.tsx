import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaDollarSign,
  FaClock,
  FaUser,
  FaStar,
  FaCheck,
  FaTimes,
  FaExchangeAlt,
} from 'react-icons/fa';
import CounterOfferForm from './CounterOfferForm';

interface Bid {
  _id: string;
  amount: number;
  deliveryTime: number;
  proposal: string;
  status: string;
  createdAt: string;
  freelancer: {
    _id: string;
    name: string;
    email: string;
    averageRating?: number;
    skills?: string[];
  };
  counterOffer?: {
    amount: number;
    deliveryTime: number;
    message: string;
  };
}

interface BidListProps {
  bids: Bid[];
  isProjectOwner: boolean;
  onAcceptBid: (bidId: string) => void;
  projectStatus: string;
}

const BidList = ({
  bids,
  isProjectOwner,
  onAcceptBid,
  projectStatus,
}: BidListProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCounterForm, setShowCounterForm] = useState<string | null>(null);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle accept bid
  const handleAcceptBid = async (bidId: string) => {
    try {
      setLoading(bidId);
      setError(null);

      await onAcceptBid(bidId);

      setLoading(null);
    } catch (err) {
      console.error('Error accepting bid:', err);
      setError('Failed to accept bid. Please try again later.');
      setLoading(null);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'countered':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render star rating
  const renderStarRating = (rating?: number) => {
    if (!rating) return null;

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`${
              i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            } ${
              i === Math.floor(rating) && rating % 1 > 0
                ? 'text-yellow-300'
                : ''
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Sort bids by status (pending first) and then by amount (lowest first)
  const sortedBids = [...bids].sort((a, b) => {
    // First sort by status
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;

    // Then sort by amount
    return a.amount - b.amount;
  });

  return (
    <div>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {sortedBids.map((bid) => (
          <div key={bid._id} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                    <FaUser />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    <Link
                      to={`/freelancers/${bid.freelancer._id}`}
                      className="hover:text-primary-600"
                    >
                      {bid.freelancer.name}
                    </Link>
                  </h3>
                  {renderStarRating(bid.freelancer.averageRating)}
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  bid.status
                )}`}
              >
                {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
              </span>
            </div>

            <div className="p-4">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <FaDollarSign className="mr-1 text-green-600" />
                  <span>Bid Amount: ${bid.amount}</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="mr-1 text-blue-600" />
                  <span>Delivery Time: {bid.deliveryTime} days</span>
                </div>
                <div className="flex items-center">
                  <span>Submitted: {formatDate(bid.createdAt)}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">Proposal</h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {bid.proposal}
                </p>
              </div>

              {/* Counter Offer Section */}
              {bid.status === 'countered' && bid.counterOffer && (
                <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold mb-2 flex items-center">
                    <FaExchangeAlt className="mr-2 text-blue-600" />
                    Counter Offer
                  </h4>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <FaDollarSign className="mr-1 text-green-600" />
                      <span>Amount: ${bid.counterOffer.amount}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-1 text-blue-600" />
                      <span>
                        Delivery Time: {bid.counterOffer.deliveryTime} days
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700">{bid.counterOffer.message}</p>
                </div>
              )}

              {/* Counter Offer Form */}
              {showCounterForm === bid._id && (
                <CounterOfferForm
                  bidId={bid._id}
                  onCancel={() => setShowCounterForm(null)}
                  onSuccess={() => {
                    setShowCounterForm(null);
                    // Reload the page to get updated bid data
                    // In a real app, you would update the state instead
                    window.location.reload();
                  }}
                />
              )}

              {/* Action Buttons */}
              {isProjectOwner &&
                bid.status === 'pending' &&
                projectStatus === 'open' && (
                  <div className="flex justify-end mt-4 space-x-2">
                    <button
                      onClick={() => handleAcceptBid(bid._id)}
                      disabled={loading === bid._id}
                      className="btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center"
                    >
                      <FaCheck className="mr-2" />
                      {loading === bid._id ? 'Accepting...' : 'Accept Bid'}
                    </button>
                    <button
                      onClick={() => setShowCounterForm(bid._id)}
                      className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                    >
                      <FaExchangeAlt className="mr-2" />
                      Counter Offer
                    </button>
                    <button className="btn bg-red-600 text-white hover:bg-red-700 flex items-center">
                      <FaTimes className="mr-2" />
                      Reject
                    </button>
                  </div>
                )}

              {/* Message Button */}
              <div className="flex justify-end mt-4">
                <Link
                  to={`/messages/${bid.freelancer._id}`}
                  className="btn btn-outline"
                >
                  Message Freelancer
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BidList;
