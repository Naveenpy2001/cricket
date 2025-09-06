// CricketScoreAnalyzer.js
import React, { useState, useRef, useEffect } from 'react';
import { Users, Target, Activity, BarChart3 } from 'lucide-react';
import PlayerManagement from './components/PlayerManagement';
import TeamManagement from './components/TeamManagement';
import MatchInterface from './components/MatchInterface';
import BallTracking from './components/BallTracking';
import PlayerForm from './components/PlayerForm';
import BallTrackingPopup from './components/BallTrackingPopup';

const CricketScoreAnalyzer = () => {
  const [cricketers, setCricketers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [ballTracking, setBallTracking] = useState([]);
  const [activeTab, setActiveTab] = useState('players');
  const [editingPlayer, setEditingPlayer] = useState(null);
  
  // Popup states
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showBallTrackingPopup, setShowBallTrackingPopup] = useState(false);
  const [ballTrackingData, setBallTrackingData] = useState(null);
  
  const groundRef = useRef(null);
  const [groundDimensions, setGroundDimensions] = useState({ width: 400, height: 300 });

  // Enhanced player management
  const [newPlayer, setNewPlayer] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    role: 'batsman',
    team: '',
    isLeftHanded: false,
    bowlingType: 'right-arm-fast',
    bowlingStyle: 'fast'
  });

  // Team management
  const [newTeam, setNewTeam] = useState({
    name: '',
    color: '#3B82F6'
  });

  // Match state
  const [matchState, setMatchState] = useState({
    team1: null,
    team2: null,
    currentBatting: null,
    currentBowling: null,
    team1Score: { runs: 0, wickets: 0, overs: 0, balls: 0, wides: 0, noBalls: 0 },
    team2Score: { runs: 0, wickets: 0, overs: 0, balls: 0, wides: 0, noBalls: 0 },
    currentBatsmen: [],
    currentBowler: null,
    totalOvers: 20
  });

  // Ball tracking popup data
  const [ballFormData, setBallFormData] = useState({
    result: '',
    fromX: 50,
    fromY: 85,
    toX: 0,
    toY: 0,
    shotType: '',
    isControlled: true
  });

  // Ground click handler for ball tracking
  const handleGroundClick = (e) => {
    if (!currentMatch || !matchState.currentBatsmen.length) {
      alert('Please select current batsmen and bowler first');
      return;
    }
    
    const rect = groundRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setBallFormData({
      ...ballFormData,
      toX: x,
      toY: y
    });
    
    setBallTrackingData({
      x,
      y,
      batsman: matchState.currentBatsmen[0]?.displayName || matchState.currentBatsmen[0]?.firstName || 'Unknown',
      bowler: matchState.currentBowler?.displayName || matchState.currentBowler?.firstName || 'Unknown',
      over: matchState.currentBatting === 'team1' ? matchState.team1Score.overs : matchState.team2Score.overs,
      ball: (matchState.currentBatting === 'team1' ? matchState.team1Score.balls : matchState.team2Score.balls) + 1
    });
    
    setShowBallTrackingPopup(true);
  };

  // Save ball tracking
  const saveBallTracking = () => {
    if (!ballFormData.result) {
      alert('Please select a ball result');
      return;
    }

    const newBall = {
      id: Date.now(),
      ...ballTrackingData,
      ...ballFormData,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setBallTracking([...ballTracking, newBall]);
    updateScore(ballFormData.result);
    setShowBallTrackingPopup(false);
    setBallFormData({
      result: '',
      fromX: 50,
      fromY: 85,
      toX: 0,
      toY: 0,
      shotType: '',
      isControlled: true
    });
  };

  // Update score based on ball result
  const updateScore = (result) => {
    const currentTeam = matchState.currentBatting;
    const scoreKey = currentTeam === 'team1' ? 'team1Score' : 'team2Score';
    const currentScore = matchState[scoreKey];
    
    let newScore = { ...currentScore };
    let validBall = true;
    
    switch(result) {
      case '0':
        break;
      case '1':
      case '2':
      case '3':
        newScore.runs += parseInt(result);
        break;
      case '4':
        newScore.runs += 4;
        break;
      case '6':
        newScore.runs += 6;
        break;
      case 'W':
        newScore.wickets += 1;
        break;
      case 'WD':
        newScore.runs += 1;
        newScore.wides += 1;
        validBall = false;
        break;
      case 'NB':
        newScore.runs += 1;
        newScore.noBalls += 1;
        validBall = false;
        break;
    }
    
    if (validBall) {
      newScore.balls += 1;
      if (newScore.balls === 6) {
        newScore.overs += 1;
        newScore.balls = 0;
      }
    }
    
    setMatchState({
      ...matchState,
      [scoreKey]: newScore
    });
  };

  // Add new player
  const addPlayer = () => {
    if (!newPlayer.firstName.trim()) {
      alert('First name is required');
      return;
    }
    
    const displayName = newPlayer.displayName || `${newPlayer.firstName} ${newPlayer.lastName}`.trim();
    
    setCricketers([...cricketers, {
      id: Date.now(),
      ...newPlayer,
      displayName
    }]);
    
    setNewPlayer({ 
      firstName: '',
      lastName: '',
      displayName: '',
      role: 'batsman',
      team: '',
      isLeftHanded: false,
      bowlingType: 'right-arm-fast',
      bowlingStyle: 'fast'
    });
    setShowPlayerForm(false);
  };

  // Add new team
  const addTeam = () => {
    if (!newTeam.name.trim()) return;
    
    setTeams([...teams, {
      id: Date.now(),
      ...newTeam
    }]);
    
    setNewTeam({ name: '', color: '#3B82F6' });
  };

  // Start match
  const startMatch = (team1Id, team2Id) => {
    const team1 = teams.find(t => t.id === team1Id);
    const team2 = teams.find(t => t.id === team2Id);
    
    setCurrentMatch({ team1, team2 });
    setMatchState({
      ...matchState,
      team1: team1,
      team2: team2,
      currentBatting: 'team1',
      currentBowling: 'team2'
    });
    setActiveTab('match');
  };

  // Delete player
  const deletePlayer = (id) => {
    setCricketers(cricketers.filter(p => p.id !== id));
  };

  // Delete team
  const deleteTeam = (id) => {
    setTeams(teams.filter(t => t.id !== id));
  };

  // Edit player
  const editPlayer = (player) => {
    setEditingPlayer(player);
    setNewPlayer({
      firstName: player.firstName,
      lastName: player.lastName,
      displayName: player.displayName,
      role: player.role,
      team: player.team,
      isLeftHanded: player.isLeftHanded || false,
      bowlingType: player.bowlingType || 'right-arm-fast',
      bowlingStyle: player.bowlingStyle || 'fast'
    });
    setShowPlayerForm(true);
  };

  // Save player edit
  const savePlayerEdit = () => {
    const displayName = newPlayer.displayName || `${newPlayer.firstName} ${newPlayer.lastName}`.trim();
    
    setCricketers(cricketers.map(p => 
      p.id === editingPlayer.id ? { ...p, ...newPlayer, displayName } : p
    ));
    setEditingPlayer(null);
    setNewPlayer({ 
      firstName: '',
      lastName: '',
      displayName: '',
      role: 'batsman',
      team: '',
      isLeftHanded: false,
      bowlingType: 'right-arm-fast',
      bowlingStyle: 'fast'
    });
    setShowPlayerForm(false);
  };

  // Cancel player edit
  const cancelPlayerEdit = () => {
    setEditingPlayer(null);
    setNewPlayer({ 
      firstName: '',
      lastName: '',
      displayName: '',
      role: 'batsman',
      team: '',
      isLeftHanded: false,
      bowlingType: 'right-arm-fast',
      bowlingStyle: 'fast'
    });
    setShowPlayerForm(false);
  };

  // Handle batsmen change
  const handleBatsmenChange = (index, playerId) => {
    const newBatsmen = [...matchState.currentBatsmen];
    const player = cricketers.find(p => p.id === playerId);
    newBatsmen[index] = player;
    setMatchState({...matchState, currentBatsmen: newBatsmen});
  };

  // Handle bowler change
  const handleBowlerChange = (playerId) => {
    const player = cricketers.find(p => p.id === playerId);
    setMatchState({...matchState, currentBowler: player});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-green-900 mb-8">
          Cricket Score Analyzer
        </h1>
        
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg flex">
            {['players', 'teams', 'match', 'tracking'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                {tab === 'players' && <Users size={20} />}
                {tab === 'teams' && <Target size={20} />}
                {tab === 'match' && <Activity size={20} />}
                {tab === 'tracking' && <BarChart3 size={20} />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'players' && (
          <PlayerManagement
            cricketers={cricketers}
            teams={teams}
            onShowPlayerForm={() => setShowPlayerForm(true)}
            onEditPlayer={editPlayer}
            onDeletePlayer={deletePlayer}
          />
        )}

        {showPlayerForm && (
          <PlayerForm
            editingPlayer={editingPlayer}
            newPlayer={newPlayer}
            teams={teams}
            onNewPlayerChange={setNewPlayer}
            onAddPlayer={addPlayer}
            onSavePlayerEdit={savePlayerEdit}
            onCancelPlayerEdit={cancelPlayerEdit}
          />
        )}

        {showBallTrackingPopup && (
          <BallTrackingPopup
            ballFormData={ballFormData}
            ballTrackingData={ballTrackingData}
            onBallFormChange={setBallFormData}
            onSaveBallTracking={saveBallTracking}
            onCancelBallTracking={() => setShowBallTrackingPopup(false)}
          />
        )}

        {activeTab === 'teams' && (
          <TeamManagement
            teams={teams}
            cricketers={cricketers}
            newTeam={newTeam}
            onNewTeamChange={setNewTeam}
            onAddTeam={addTeam}
            onDeleteTeam={deleteTeam}
            onStartMatch={startMatch}
          />
        )}

        {activeTab === 'match' && (
          <MatchInterface
            currentMatch={currentMatch}
            matchState={matchState}
            cricketers={cricketers}
            ballTracking={ballTracking}
            onGroundClick={handleGroundClick}
            onUpdateScore={updateScore}
            onBatsmenChange={handleBatsmenChange}
            onBowlerChange={handleBowlerChange}
          />
        )}

        {activeTab === 'tracking' && (
          <BallTracking ballTracking={ballTracking} />
        )}
      </div>
    </div>
  );
};

export default CricketScoreAnalyzer;