// client/src/components/layout/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Header() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md py-4 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <Link to="/" className="flex items-center space-x-2 text-gray-800 text-2xl sm:text-3xl font-extrabold">
          <span>Network Sim Pro</span>
        </Link>

        <nav className="flex-grow flex justify-center mt-4 sm:mt-0">
          {isAuthenticated ? (
            <ul className="flex bg-gray-100 rounded-full px-4 py-2 space-x-4 sm:space-x-6 text-sm sm:text-base font-medium">
              <li>
                <Link to="/" className="text-gray-700 hover:text-blue-600 transition duration-200 py-1 px-3 rounded-full hover:bg-gray-200">
                  Devices
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin-dashboard" className="text-gray-700 hover:text-blue-600 transition duration-200 py-1 px-3 rounded-full hover:bg-gray-200">
                    Admin Dashboard
                  </Link>
                </li>
              )}
            </ul>
          ) : (
            <ul className="flex bg-gray-100 rounded-full px-4 py-2 space-x-4 sm:space-x-6 text-sm sm:text-base font-medium">
              <li>
                {/* if ou intend to add public links later, otherwise remove it */}
              </li>
            </ul>
          )}
        </nav>

        <div className="mt-4 sm:mt-0">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-5 rounded-full
                         shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5
                         text-sm sm:text-base whitespace-nowrap"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center
                         bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-5 rounded-full
                         shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5
                         text-sm sm:text-base whitespace-nowrap"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;