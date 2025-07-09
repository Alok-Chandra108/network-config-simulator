// client/src/components/common/LoadingSpinner.jsx
import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div
        className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

export default LoadingSpinner;