// client/src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

function NotFoundPage() {
  return (

    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 text-center max-w-lg w-full">
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-blue-600 mb-4 animate-pulse">
          404
        </h1>
        <p className="text-2xl sm:text-3xl font-medium mt-4 mb-4 text-gray-800">
          Page Not Found
        </p>
        <p className="text-base sm:text-lg text-center max-w-prose mb-8 text-gray-600">
          Oops! It looks like the page you are trying to reach doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button
            variant="primary"
            className="px-6 py-3 text-base sm:text-lg font-semibold" // Responsive button sizing
          >
            Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;