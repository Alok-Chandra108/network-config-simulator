// client/src/pages/UnauthorizedPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  return (

    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 text-center max-w-lg w-full">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-red-600 mb-4 animate-pulse">
          403
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
          Access Denied
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6">
          You do not have the necessary permissions to view this page.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center
                     px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl
                     shadow-lg hover:bg-blue-700 hover:shadow-xl
                     transition duration-300 transform hover:-translate-y-0.5
                     text-base sm:text-lg whitespace-nowrap" 
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;