// src/components/Toast.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Toast = ({ message, type, visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'info' ? 'bg-blue-500 text-white' :
      'bg-gray-800 text-white'
    } ${visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-3">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;