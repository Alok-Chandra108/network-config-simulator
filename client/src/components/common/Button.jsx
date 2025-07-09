// client/src/components/common/Button.jsx
import React from 'react';

function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false, ...props }) {
  const baseClasses = "px-4 py-2 rounded-lg font-semibold transition duration-300 ease-in-out shadow-md";
  const primaryClasses = "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
  const secondaryClasses = "bg-gray-300 text-gray-800 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2";
  const dangerClasses = "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2";

  let classes = baseClasses;
  if (variant === 'primary') {
    classes += ` ${primaryClasses}`;
  } else if (variant === 'secondary') {
    classes += ` ${secondaryClasses}`;
  } else if (variant === 'danger') {
    classes += ` ${dangerClasses}`;
  }

  if (disabled) {
    classes += " opacity-50 cursor-not-allowed";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;