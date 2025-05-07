import { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  autoClose?: boolean;
  duration?: number;
  onClose?: () => void;
}

const Alert = ({
  type,
  message,
  autoClose = true,
  duration = 5000,
  onClose,
}: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const alertStyles = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };

  const iconStyles = {
    success: <FaCheckCircle className="h-5 w-5 text-green-500" />,
    error: <FaExclamationCircle className="h-5 w-5 text-red-500" />,
    info: <FaInfoCircle className="h-5 w-5 text-blue-500" />,
    warning: <FaExclamationCircle className="h-5 w-5 text-yellow-500" />,
  };

  return (
    <div
      className={`rounded-md border p-4 mb-4 flex justify-between items-center ${alertStyles[type]}`}
      role="alert"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">{iconStyles[type]}</div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
      <button
        type="button"
        className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        onClick={handleClose}
        aria-label="Close"
      >
        <FaTimes className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Alert;
