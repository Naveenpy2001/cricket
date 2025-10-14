// src/components/TossDecisionContent.jsx
import React from 'react';
import { Target } from 'lucide-react';

const TossDecisionContent = ({ matchConfig, teams, onTossDecision }) => {
  const team1 = teams.team1;
  const team2 = teams.team2;

  return (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🏏</div>
      <h3 className="text-2xl font-bold">Toss Time!</h3>
      <p className="text-gray-600">Who won the toss and what did they choose?</p>
      
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'team1', team: team1 },
          { key: 'team2', team: team2 }
        ].map(({ key, team }) => (
          <div key={key} className="space-y-3 bg-gray-50 rounded-lg p-4">
            <h4 className="font-bold text-lg text-gray-800">
              {team.name}
              {team.short_name && (
                <span className="text-sm text-gray-600 ml-2">({team.short_name})</span>
              )}
            </h4>
            <button
              onClick={() => onTossDecision(key, 'bat')}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Target className="w-5 h-5" />
              <span>Won Toss - Bat First</span>
            </button>
            <button
              onClick={() => onTossDecision(key, 'bowl')}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
            >
              <div className="w-5 h-5 rounded-full bg-white"></div>
              <span>Won Toss - Bowl First</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TossDecisionContent;