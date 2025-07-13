// client/src/components/common/InputField.jsx
import React from 'react';

function InputField({ label, id, type = 'text', value, onChange, placeholder, required = false, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-2.5 
                   border border-gray-300 rounded-md shadow-sm 
                   placeholder-gray-400 focus:outline-none 
                   focus:ring-blue-500 focus:border-blue-500 
                   text-sm sm:text-base"
        {...props}
      />
    </div>
  );
}

export default InputField;