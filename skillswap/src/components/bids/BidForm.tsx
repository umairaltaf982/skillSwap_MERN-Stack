import { useState } from 'react';
import { FaDollarSign, FaClock, FaFileAlt } from 'react-icons/fa';

interface BidFormProps {
  projectId: string;
  onSubmit: (bidData: any) => void;
  onCancel: () => void;
  initialData?: {
    amount: number;
    deliveryTime: number;
    proposal: string;
  };
  isEditing?: boolean;
}

const BidForm = ({ projectId, onSubmit, onCancel, initialData, isEditing = false }: BidFormProps) => {
  const [formData, setFormData] = useState({
    amount: initialData?.amount || '',
    deliveryTime: initialData?.deliveryTime || '',
    proposal: initialData?.proposal || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare bid data
      const bidData = {
        amount: parseFloat(formData.amount.toString()),
        deliveryTime: parseInt(formData.deliveryTime.toString()),
        proposal: formData.proposal,
      };
      
      // Submit bid
      await onSubmit(bidData);
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error submitting bid:', err);
      setError(err.response?.data?.error || 'Failed to submit bid. Please try again later.');
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="amount" className="form-label flex items-center">
              <FaDollarSign className="mr-1 text-green-600" />
              Bid Amount (USD)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your bid amount"
              min="1"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label htmlFor="deliveryTime" className="form-label flex items-center">
              <FaClock className="mr-1 text-blue-600" />
              Delivery Time (Days)
            </label>
            <input
              type="number"
              id="deliveryTime"
              name="deliveryTime"
              value={formData.deliveryTime}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter delivery time in days"
              min="1"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="proposal" className="form-label flex items-center">
            <FaFileAlt className="mr-1 text-purple-600" />
            Proposal
          </label>
          <textarea
            id="proposal"
            name="proposal"
            value={formData.proposal}
            onChange={handleChange}
            className="form-input h-32"
            placeholder="Write your proposal explaining why you're the best fit for this project"
            required
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : isEditing ? 'Update Bid' : 'Submit Bid'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BidForm;
