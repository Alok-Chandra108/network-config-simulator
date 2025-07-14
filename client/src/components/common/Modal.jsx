// client/src/components/common/Modal.jsx
import React from 'react';
import { createPortal } from 'react-dom';

function Modal({ children, isOpen, onClose, title }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-light leading-none transition-colors duration-200"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="text-gray-700">
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') 
  );
}

export default Modal;