import React from 'react';
import { AlertTriangle, RotateCcw, X, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ErrorCard = ({ 
  error = 'Something went wrong', 
  onRetry, 
  onDismiss,
  showRetry = true,
  showDismiss = false,
  showBack = false, 
  className = "" 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className={`bg-white border border-red-200 rounded-xl shadow-sm p-6 max-w-md w-full mx-auto ${className}`}>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="mt-0.5 p-2 bg-red-100 rounded-full flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-red-800 mb-2">Something went wrong</h3>
          <p className="text-red-600 mb-4 text-sm leading-relaxed break-words font-semibold">
            {error}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {showRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            )}
            
            {showBack && (
              <button
                onClick={handleBack}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Go Back
              </button>
            )}
            
            {showDismiss && (
              <button
                onClick={onDismiss}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};