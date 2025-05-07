import { useState } from 'react';
import {
  FaDollarSign,
  FaClock,
  FaComment,
  FaPaperPlane,
  FaTimes,
} from 'react-icons/fa';
import bidService from '../../services/bids';
import Alert from '../common/Alert';

interface CounterOfferFormProps {
  bidId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const CounterOfferForm = ({
  bidId,
  onCancel,
  onSuccess,
}: CounterOfferFormProps) => {
  const [formData, setFormData] = useState({
    amount: '',
    deliveryTime: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Validate form
      if (!formData.amount || !formData.deliveryTime || !formData.message) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Prepare counter offer data
      const counterOfferData = {
        amount: parseFloat(formData.amount),
        deliveryTime: parseInt(formData.deliveryTime),
        message: formData.message,
      };

      // Submit counter offer
      await bidService.counterBid(bidId, counterOfferData);

      setLoading(false);
      onSuccess();
    } catch (err: any) {
      console.error('Error submitting counter offer:', err);
      setError(
        err.response?.data?.error ||
          'Failed to submit counter offer. Please try again later.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200 shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="bg-blue-600 text-white rounded-full p-1.5 mr-3">
            <FaPaperPlane className="h-4 w-4" />
          </span>
          Create Counter Offer
        </h4>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="amount"
              className=" text-sm font-medium text-gray-700 flex items-center"
            >
              <FaDollarSign className="mr-2 text-green-600" />
              Counter Amount (USD)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="block w-full pl-8 pr-3 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="0.00"
                min="1"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="deliveryTime"
              className=" text-sm font-medium text-gray-700 flex items-center"
            >
              <FaClock className="mr-2 text-blue-600" />
              Delivery Timeline
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                id="deliveryTime"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleChange}
                className="block w-full pr-12 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Number of days"
                min="1"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="message"
            className=" text-sm font-medium text-gray-700 flex items-center"
          >
            <FaComment className="mr-2 text-indigo-600" />
            Your Proposal
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Explain why your counter offer is reasonable and how you'll deliver exceptional value..."
            rows={4}
            required
          ></textarea>
        </div>

        <div className="pt-2 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <FaPaperPlane className="mr-2 -ml-1 h-4 w-4" />
            {loading ? 'Sending Offer...' : 'Send Counter Offer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CounterOfferForm;
