// client/src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button'; // Assuming you have this now

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] text-gray-700 bg-white rounded-2xl shadow-xl border border-gray-100 p-8 m-4">
      <h1 className="text-6xl md:text-8xl font-extrabold text-blue-600 animate-pulse">404</h1>
      <p className="text-2xl md:text-3xl font-medium mt-4 mb-4 text-gray-800">Page Not Found</p>
      <p className="text-lg md:text-xl text-center max-w-prose mb-8 text-gray-600">
        Oops! It looks like the page you are trying to reach doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary">
          Go to Homepage
        </Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;