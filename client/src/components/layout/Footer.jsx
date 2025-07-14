// client/src/components/layout/Footer.jsx
import React from 'react';

function Footer() {
  return (
    <footer className="bg-white shadow-md py-4 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="container mx-auto text-center text-gray-700 opacity-80">
        &copy; {new Date().getFullYear()} Network Sim Pro. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;