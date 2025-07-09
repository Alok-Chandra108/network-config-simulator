// client/src/components/layout/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <Link to="/" className="text-3xl font-extrabold text-white tracking-wide hover:text-blue-300 transition duration-300 ease-in-out">
          Network Sim Pro
        </Link>
        <nav>
          <ul className="flex flex-wrap justify-center space-x-6">
            <li>
              <Link to="/" className="text-lg font-medium hover:text-blue-300 transition duration-300 ease-in-out py-1">Home</Link>
            </li>
            <li>
              <Link to="/device/add" className="text-lg font-medium hover:text-blue-300 transition duration-300 ease-in-out py-1">Add Device</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;