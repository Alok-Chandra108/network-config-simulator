// client/src/components/layout/Footer.jsx
import React from 'react';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 mt-12 shadow-inner text-sm">
      <div className="container mx-auto text-center opacity-80">
        &copy; {new Date().getFullYear()} Network Sim Pro. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;