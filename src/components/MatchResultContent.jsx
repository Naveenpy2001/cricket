// src/components/MatchResultContent.jsx


import React, { useEffect, useState } from 'react';
import { Trophy, User } from 'lucide-react';
import { getScorecard } from '../services/api';


const MatchResultContent = ({ matchConfig, teams, onNewMatch }) => {
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerOfMatch, setPlayerOfMatch] = useState('');
  const [selectingPOM, setSelectingPOM] = useState(false);

  useEffect(() => {
    const fetchScorecard = async () => {
      if (!matchConfig.id) return;
      setLoading(true);
      try {
        const response = await getScorecard(matchConfig.id);
        setScorecard(response.data);
      } catch (error) {
        setScorecard(null);
      }
      setLoading(false);
    };
    fetchScorecard();
  }, [matchConfig.id]);

  if (loading) {
    return <div className="text-center py-8">Loading match result...</div>;
  }

  if (!scorecard) {
    return <div className="text-center py-8 text-red-600">Could not load match result.</div>;
  }

  const matchInfo = scorecard.match_info || {};
  const innings = scorecard.innings || [];
  const winner = matchInfo.winning_team_name || 'No winner';
  const margin = matchInfo.win_margin || '';

  // Collect all players for Player of the Match selection
  const allPlayers = [];
  innings.forEach(inning => {
    if (inning.batting_summary) {
      inning.batting_summary.forEach(rec => {
        if (!allPlayers.find(p => p.id === rec.player)) {
          allPlayers.push({ id: rec.player, name: rec.player_name });
        }
      });
    }
    if (inning.bowling_summary) {
      inning.bowling_summary.forEach(rec => {
        if (!allPlayers.find(p => p.id === rec.player)) {
          allPlayers.push({ id: rec.player, name: rec.player_name });
        }
      });
    }
  });

  return (
    <div className="text-center space-y-6">
      <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
      <h3 className="text-3xl font-bold">Match Complete!</h3>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 space-y-4">
        <div className="text-2xl font-bold text-green-600">{winner} Wins!</div>
        <div className="text-lg">{margin}</div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {innings.map((inning, idx) => (
            <div key={idx} className="text-center bg-white rounded-lg p-4">
              <div className="text-xl font-bold">{inning.batting_team_name}</div>
              <div className="text-2xl text-blue-600">{inning.total_runs}/{inning.wickets}</div>
              <div className="text-sm text-gray-600">({inning.total_overs} ov)</div>
            </div>
          ))}
        </div>
      </div>

      {/* Player of the Match Selection */}
      <div className="mt-6">
        <div className="font-bold text-lg mb-2 flex items-center justify-center gap-2">
          <User className="w-6 h-6 text-purple-600" />
          Player of the Match
        </div>
        {playerOfMatch ? (
          <div className="text-xl text-purple-700 font-bold">{playerOfMatch}</div>
        ) : (
          <>
            {!selectingPOM && (
              <button
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                onClick={() => setSelectingPOM(true)}
              >
                Select Player
              </button>
            )}
            {selectingPOM && (
              <div className="mt-2 flex flex-wrap gap-2 justify-center">
                {allPlayers.map(p => (
                  <button
                    key={p.id}
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-purple-200"
                    onClick={() => {
                      setPlayerOfMatch(p.name);
                      setSelectingPOM(false);
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Batting and Bowling Summaries */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {innings.map((inning, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-4">
            <div className="font-bold text-lg mb-2">{inning.batting_team_name} Batting</div>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Player</th>
                  <th>Runs</th>
                  <th>Balls</th>
                  <th>4s</th>
                  <th>6s</th>
                  <th>SR</th>
                </tr>
              </thead>
              <tbody>
                {inning.batting_summary?.map((rec, i) => (
                  <tr key={i}>
                    <td>{rec.player_name}</td>
                    <td>{rec.runs}</td>
                    <td>{rec.balls_faced}</td>
                    <td>{rec.fours}</td>
                    <td>{rec.sixes}</td>
                    <td>{rec.strike_rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="font-bold text-lg mt-4 mb-2">{inning.bowling_team_name} Bowling</div>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Player</th>
                  <th>Overs</th>
                  <th>Runs</th>
                  <th>Wkts</th>
                  <th>Eco</th>
                </tr>
              </thead>
              <tbody>
                {inning.bowling_summary?.map((rec, i) => (
                  <tr key={i}>
                    <td>{rec.player_name}</td>
                    <td>{rec.overs_bowled}</td>
                    <td>{rec.runs_conceded}</td>
                    <td>{rec.wickets}</td>
                    <td>{rec.economy_rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <button
        onClick={onNewMatch}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors mt-8"
      >
        New Match
      </button>
    </div>
  );
};

export default MatchResultContent;