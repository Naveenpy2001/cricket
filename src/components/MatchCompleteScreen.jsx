// src/components/MatchCompleteScreen.jsx
import React from 'react';
import { Trophy } from 'lucide-react';

const MatchCompleteScreen = ({ onResetMatch }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-blue-900 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Match Complete!</h1>
        <button
          onClick={onResetMatch}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          Start New Match
        </button>
      </div>
    </div>
  );
};

export default MatchCompleteScreen;