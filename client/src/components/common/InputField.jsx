// client/src/components/common/InputField.jsx
import React from 'react';

function InputField({ label, id, type = 'text', value, onChange, placeholder, required = false, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
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
        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2"
        {...props}
      />
    </div>
  );
}

export default InputField;