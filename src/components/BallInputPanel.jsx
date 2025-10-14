// src/components/BallInputPanel.jsx
import React, { useState, useEffect } from 'react';
import { Target, Save, Check, ChevronRight, Users, RotateCcw, Zap } from 'lucide-react';
import Modal from './Modal';
import { getInnings  } from '../services/api';

const BallInputPanel = ({
  unsavedRuns,
  unsavedEvent,
  isSaved,
  onRunInput,
  onSaveBall,
  onNextBall,
  teams,
  striker,
  nonStriker,
  bowler,
  matchConfig,
  onPlayersUpdate,
  onEventInput,
  currentOver, // Add current over number
  currentBall // Add current ball number
}) => {
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [inningsData, setInningsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableBatsmen, setAvailableBatsmen] = useState([]);
  const [availableBowlers, setAvailableBowlers] = useState([]);
  const [availableFielders, setAvailableFielders] = useState([]);
  const [selectedFielder, setSelectedFielder] = useState(null);
  const [selectedWicketType, setSelectedWicketType] = useState(null);

  const penaltyRunOptions = [
    { type: 'wide', label: 'Wide', runs: 1, event: 'wide' },
    { type: 'noball', label: 'No Ball', runs: 1, event: 'noball' },
    { type: 'bye', label: 'Bye', runs: 1, event: 'bye' },
    { type: 'legbye', label: 'Leg Bye', runs: 1, event: 'legbye' },
    { type: 'penalty', label: 'Penalty Runs', runs: 5, event: 'penalty' }
  ];

  const wicketTypes = [
    { type: 'bowled', label: 'Bowled', requiresFielder: false },
    { type: 'caught', label: 'Caught', requiresFielder: true },
    { type: 'lbw', label: 'LBW', requiresFielder: false },
    { type: 'run_out', label: 'Run Out', requiresFielder: true },
    { type: 'stumped', label: 'Stumped', requiresFielder: true },
    { type: 'hit_wicket', label: 'Hit Wicket', requiresFielder: false },
    { type: 'retired', label: 'Retired', requiresFielder: false }
  ];

  const fieldEvents = [
    { type: 'catch_taken', label: 'Catch Taken' },
    { type: 'catch_missed', label: 'Catch Missed' },
    { type: 'run_out_attempt', label: 'Run Out Attempt' },
    { type: 'stumping_attempt', label: 'Stumping Attempt' },
    { type: 'direct_hit', label: 'Direct Hit' },
    { type: 'good_fielding', label: 'Good Fielding' },
    { type: 'poor_fielding', label: 'Poor Fielding' }
  ];

  // Fetch innings data
  const fetchInningsData = async () => {
    if (!matchConfig.id) return;
    
    setIsLoading(true);
    try {
      const response = await getInnings (matchConfig.id);
      const innings = response.data.results || response.data || [];
      
      if (innings.length > 0) {
        const currentInning = innings.find(inning => 
          inning.inning_number === matchConfig.currentInnings
        ) || innings[0];
        
        if (currentInning) {
          setInningsData(currentInning);
          updateAvailablePlayers(currentInning);
        }
      }
    } catch (error) {
      console.error('Error fetching innings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update available players from innings data
  const updateAvailablePlayers = (inningData) => {
    // Get batting team players
    const battingTeamPlayers = Object.values(teams)?.find(team => 
      team.id === inningData.batting_team
    )?.players || [];

    // Get bowling team players
    const bowlingTeamPlayers = Object.values(teams)?.find(team => 
      team.id === inningData.bowling_team
    )?.players || [];

    if (inningData.batting_records) {
      const batsmen = inningData.batting_records.map(record => ({
        id: record.player,
        name: record.player_name,
        runs: record.runs,
        balls_faced: record.balls_faced,
        is_out: record.is_out
      })).filter(player => !player.is_out); // Only show players who are not out
      
      setAvailableBatsmen(batsmen);
    }

    if (inningData.bowling_records) {
      const bowlers = inningData.bowling_records.map(record => ({
        id: record.player,
        name: record.player_name,
        overs_bowled: record.overs_bowled,
        wickets: record.wickets,
        economy_rate: record.economy_rate
      }));
      
      setAvailableBowlers(bowlers);
    }

    // Set available fielders (bowling team players)
    setAvailableFielders(bowlingTeamPlayers);
  };

  // Update players
  const handlePlayerChange = (type, playerName) => {
    if (onPlayersUpdate) {
      onPlayersUpdate({
        striker: type === 'striker' ? playerName : striker,
        nonStriker: type === 'nonStriker' ? playerName : nonStriker,
        bowler: type === 'bowler' ? playerName : bowler
      });
    }
  };

  // Swap batsmen
  const handleSwapBatsmen = () => {
    if (onPlayersUpdate) {
      onPlayersUpdate({
        striker: nonStriker,
        nonStriker: striker,
        bowler: bowler
      });
    }
  };

  // Handle wicket with proper data structure
  const handleWicket = (wicketType, fielderId = null) => {
    if (onEventInput) {
      const wicketData = {
        ball_number: currentBall || 1,
        event: 'wicket',
        runs: 0, // Wicket usually has 0 runs
        is_wicket: true,
        wicket_type: wicketType,
        fielder: fielderId,
        dismissed_batsman: striker, // Default to striker
        batsman: striker,
        is_extra: false
      };
      
      onEventInput(wicketData);
    }
    setShowWicketModal(false);
    setSelectedFielder(null);
    setSelectedWicketType(null);
  };

  // Handle field event
  const handleFieldEvent = (eventType, fielderId = null) => {
    if (onEventInput) {
      const eventData = {
        ball_number: currentBall || 1,
        event: eventType,
        runs: 0,
        is_wicket: false,
        batsman: striker,
        is_extra: false
      };
      
      onEventInput(eventData);
    }
    setShowEventModal(false);
  };

  // Handle run input with proper data structure
  const handleRunInput = (runs) => {
    let eventType = 'dot';
    
    if (runs === 0) eventType = 'dot';
    else if (runs === 1) eventType = 'single';
    else if (runs === 2) eventType = 'two';
    else if (runs === 3) eventType = 'three';
    else if (runs === 4) eventType = 'four';
    else if (runs === 5) eventType = 'five';
    else if (runs === 6) eventType = 'six';
    
    const runData = {
      ball_number: currentBall || 1,
      event: eventType,
      runs: runs,
      is_wicket: false,
      batsman: striker,
      is_extra: false
    };
    
    onRunInput(runs, eventType, runData);
  };

  // Handle extra run input
  const handleExtraRun = (option) => {
    const extraData = {
      ball_number: currentBall || 1,
      event: option.event,
      runs: option.runs,
      is_wicket: false,
      batsman: striker,
      is_extra: true,
      extra_type: option.type,
      extra_runs: option.runs
    };
    
    onRunInput(option.runs, option.event, extraData);
    setShowExtraModal(false);
  };

  // Refresh innings data
  const handleRefresh = () => {
    fetchInningsData();
  };

  // Handle fielder selection for wicket
  const handleFielderSelection = (wicketType) => {
    setSelectedWicketType(wicketType);
    setShowWicketModal(false);
  };

  // Confirm wicket with fielder
  const confirmWicketWithFielder = (fielderId) => {
    if (selectedWicketType && fielderId) {
      handleWicket(selectedWicketType, fielderId);
    }
  };

  useEffect(() => {
    fetchInningsData();
  }, [matchConfig.id, matchConfig.currentInnings]);

  // Get current batsmen stats
  const getBatsmanStats = (batsmanName) => {
    if (!inningsData || !inningsData.batting_records) return null;
    return inningsData.batting_records.find(record => 
      record.player_name === batsmanName
    );
  };

  // Get current bowler stats
  const getBowlerStats = (bowlerName) => {
    if (!inningsData || !inningsData.bowling_records) return null;
    return inningsData.bowling_records.find(record => 
      record.player_name === bowlerName
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-600" />
          Current Ball ({currentOver || 0}.{currentBall || 0})
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
        >
          <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Quick Player Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Current Players</span>
          <button
            onClick={() => setShowPlayerModal(true)}
            className="flex items-center space-x-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
          >
            <Users className="w-3 h-3" />
            <span>Change</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-yellow-100 p-2 rounded">
            <div className="font-semibold">🏏 Striker</div>
            <div className="truncate">{striker || 'Not set'}</div>
            {striker && getBatsmanStats(striker) && (
              <div className="text-gray-600">
                {getBatsmanStats(striker).runs}({getBatsmanStats(striker).balls_faced})
              </div>
            )}
          </div>
          
          <div className="bg-blue-100 p-2 rounded">
            <div className="font-semibold">👥 Non-Striker</div>
            <div className="truncate">{nonStriker || 'Not set'}</div>
            {nonStriker && getBatsmanStats(nonStriker) && (
              <div className="text-gray-600">
                {getBatsmanStats(nonStriker).runs}({getBatsmanStats(nonStriker).balls_faced})
              </div>
            )}
          </div>
        </div>
        
        {bowler && (
          <div className="mt-2 bg-red-100 p-2 rounded text-xs">
            <div className="font-semibold">🎯 Bowler</div>
            <div className="truncate">{bowler}</div>
            {getBowlerStats(bowler) && (
              <div className="text-gray-600">
                {getBowlerStats(bowler).overs_bowled} ov, {getBowlerStats(bowler).wickets} w
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Runs Input */}
      <div className="mb-4">
        <h4 className="font-semibold mb-3 text-gray-700">Runs</h4>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3, 4, 5, 6].map(run => (
            <button
              key={run}
              onClick={() => handleRunInput(run)}
              className={`p-3 rounded-lg font-bold transition-all duration-200 ${
                unsavedRuns === run 
                  ? 'bg-blue-500 text-white scale-105 shadow-lg' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {run}
            </button>
          ))}
          <button
            onClick={() => setShowExtraModal(true)}
            className="p-3 rounded-lg font-bold bg-purple-100 hover:bg-purple-200 text-purple-800 transition-colors"
          >
            Extra
          </button>
        </div>
      </div>

      {/* Wicket & Events Input */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-gray-700">Events</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowWicketModal(true)}
            className="p-3 rounded-lg font-bold bg-red-100 hover:bg-red-200 text-red-800 transition-colors flex items-center justify-center space-x-1"
          >
            <Zap className="w-4 h-4" />
            <span>Wicket</span>
          </button>
          <button
            onClick={() => setShowEventModal(true)}
            className="p-3 rounded-lg font-bold bg-green-100 hover:bg-green-200 text-green-800 transition-colors flex items-center justify-center space-x-1"
          >
            <Users className="w-4 h-4" />
            <span>Field Event</span>
          </button>
        </div>
        
        {/* Unsaved Events Display */}
        {(unsavedRuns !== '' || unsavedEvent !== '') && !isSaved && (
          <div className="mt-3 text-sm text-orange-600 font-semibold bg-orange-50 p-2 rounded-lg">
            {unsavedRuns !== '' && `Unsaved: ${unsavedRuns} runs`}
            {unsavedRuns !== '' && unsavedEvent !== '' && ' • '}
            {unsavedEvent !== '' && `Event: ${unsavedEvent}`}
            {!unsavedRuns && !unsavedEvent && 'Click Save to confirm'}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onSaveBall}
          disabled={unsavedRuns === '' && unsavedEvent === ''}
          className={`w-full py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center space-x-2 ${
            isSaved 
              ? 'bg-green-500 text-white' 
              : unsavedRuns !== '' || unsavedEvent !== ''
                ? 'bg-orange-500 text-white hover:bg-orange-600 scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-5 h-5" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Ball</span>
            </>
          )}
        </button>

        <button
          onClick={onNextBall}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <ChevronRight className="w-5 h-5" />
          <span>Next Ball</span>
        </button>
      </div>

      {/* Extra Runs Modal */}
      <Modal 
        isOpen={showExtraModal} 
        onClose={() => setShowExtraModal(false)} 
        title="Extra Runs"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">Select type of extra runs:</p>
          <div className="grid grid-cols-2 gap-2">
            {penaltyRunOptions.map(option => (
              <button
                key={option.type}
                onClick={() => handleExtraRun(option)}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors text-sm"
              >
                {option.label} (+{option.runs})
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Wicket Modal */}
      <Modal 
        isOpen={showWicketModal} 
        onClose={() => setShowWicketModal(false)} 
        title="Wicket"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">Select wicket type:</p>
          <div className="grid grid-cols-2 gap-2">
            {wicketTypes.map(wicket => (
              <button
                key={wicket.type}
                onClick={() => {
                  if (wicket.requiresFielder) {
                    handleFielderSelection(wicket.type);
                  } else {
                    handleWicket(wicket.type);
                  }
                }}
                className="p-3 bg-red-100 hover:bg-red-200 rounded-lg font-bold transition-colors text-sm"
              >
                {wicket.label}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Fielder Selection Modal */}
      <Modal 
        isOpen={selectedWicketType !== null} 
        onClose={() => setSelectedWicketType(null)} 
        title="Select Fielder"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">Select fielder for {selectedWicketType}:</p>
          <div className="max-h-60 overflow-y-auto">
            {availableFielders.map(fielder => (
              <button
                key={fielder.id}
                onClick={() => confirmWicketWithFielder(fielder.id)}
                className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors mb-2"
              >
                {fielder.name}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Field Event Modal */}
      <Modal 
        isOpen={showEventModal} 
        onClose={() => setShowEventModal(false)} 
        title="Field Event"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">Select field event:</p>
          <div className="grid grid-cols-2 gap-2">
            {fieldEvents.map(event => (
              <button
                key={event.type}
                onClick={() => {
                  const fielderName = prompt(`Select fielder for ${event.label}:`, availableFielders[0]?.name);
                  if (fielderName) {
                    const fielder = availableFielders.find(f => f.name === fielderName);
                    if (fielder) {
                      handleFieldEvent(event.type, fielder.id);
                    }
                  }
                }}
                className="p-3 bg-green-100 hover:bg-green-200 rounded-lg font-bold transition-colors text-sm"
              >
                {event.label}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Player Selection Modal */}
      <Modal 
        isOpen={showPlayerModal} 
        onClose={() => setShowPlayerModal(false)} 
        title="Change Players"
        size="md"
      >
        <div className="space-y-4">
          {/* Striker Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              🏏 Striker
            </label>
            <select 
              value={striker} 
              onChange={(e) => handlePlayerChange('striker', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-yellow-50 focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Select Striker</option>
              {availableBatsmen.map(player => (
                <option key={player.id} value={player.name}>
                  {player.name} - {player.runs}({player.balls_faced})
                </option>
              ))}
            </select>
          </div>

          {/* Non-Striker Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              👥 Non-Striker
            </label>
            <select 
              value={nonStriker} 
              onChange={(e) => handlePlayerChange('nonStriker', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-blue-50 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Non-Striker</option>
              {availableBatsmen.map(player => (
                <option key={player.id} value={player.name}>
                  {player.name} - {player.runs}({player.balls_faced})
                </option>
              ))}
            </select>
          </div>

          {/* Bowler Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              🎯 Bowler
            </label>
            <select 
              value={bowler} 
              onChange={(e) => handlePlayerChange('bowler', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-red-50 focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select Bowler</option>
              {availableBowlers.map(player => (
                <option key={player.id} value={player.name}>
                  {player.name} - {player.overs_bowled} ov, {player.wickets} w
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapBatsmen}
            disabled={!striker || !nonStriker}
            className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              !striker || !nonStriker
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Swap Striker & Non-Striker</span>
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BallInputPanel;