import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings, RotateCcw, RefreshCw, Plus, Edit3, Users, Trophy,X,Check,Clock,Target,UserPlus,Save
} from 'lucide-react';
import FieldSetGround from './components/FieldSetGround ';
import CricketFieldingTracker from './FieldsTrack';


// Toast notification system
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

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className={`relative bg-white rounded-xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const AdvancedCricketManager = () => {
  const [gameState, setGameState] = useState('setup'); 
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [modals, setModals] = useState({
    playerManagement: false,
    matchSettings: false,
    tossDecision: false,
    matchResult: false
  });



  // Match Configuration
  const [matchConfig, setMatchConfig] = useState(() => (
    {
    matchType: 'T20',
    overs: 20,
    team1: 'Leicestershire',
    team2: 'Essex',
    venue: 'Fischer County Ground',
    tossWinner: '',
    tossDecision: '',
    currentInnings: 1
  }
  ));

  // Teams and Players
 const [teams, setTeams] = useState({
  team1: {
    name: 'Leicestershire',
    players: [
      { id: 1, fname: 'Paul', lname: 'Horton', displayName: 'PJ Horton', role: 'batsman', bowlerType: '', leftHanded: false, age: 28 },
      { id: 2, fname: 'Neil', lname: 'Dexter', displayName: 'NJ Dexter', role: 'allrounder', bowlerType: 'medium', leftHanded: true, age: 32 },
      { id: 3, fname: 'Alex', lname: 'Cook', displayName: 'AR Cook', role: 'batsman', bowlerType: '', leftHanded: false, age: 25 },
      { id: 4, fname: 'James', lname: 'Taylor', displayName: 'JL Taylor', role: 'batsman', bowlerType: '', leftHanded: true, age: 30 },
      { id: 5, fname: 'Mark', lname: 'Cosgrove', displayName: 'MJ Cosgrove', role: 'batsman', bowlerType: '', leftHanded: true, age: 33 },
      { id: 6, fname: 'Clint', lname: 'McKay', displayName: 'CJ McKay', role: 'bowler', bowlerType: 'fast', leftHanded: false, age: 34 },
      { id: 7, fname: 'Ben', lname: 'Raine', displayName: 'BM Raine', role: 'allrounder', bowlerType: 'medium', leftHanded: false, age: 27 },
      { id: 8, fname: 'Tom', lname: 'Wells', displayName: 'TJ Wells', role: 'allrounder', bowlerType: 'medium', leftHanded: true, age: 26 },
      { id: 9, fname: 'Aadil', lname: 'Ali', displayName: 'A Ali', role: 'batsman', bowlerType: '', leftHanded: false, age: 24 },
      { id: 10, fname: 'Richard', lname: 'Jones', displayName: 'RA Jones', role: 'bowler', bowlerType: 'fast', leftHanded: false, age: 31 },
      { id: 11, fname: 'Jigar', lname: 'Naik', displayName: 'J Naik', role: 'bowler', bowlerType: 'spin', leftHanded: false, age: 29 }
    ]
  },
  team2: {
    name: 'Essex',
    players: [
      { id: 12, fname: 'Adam', lname: 'Robson', displayName: 'AJ Robson', role: 'bowler', bowlerType: 'fast', leftHanded: false, age: 29 },
      { id: 13, fname: 'Tom', lname: 'Westley', displayName: 'TE Westley', role: 'allrounder', bowlerType: 'spin', leftHanded: false, age: 31 },
      { id: 14, fname: 'Ryan', lname: 'Bopara', displayName: 'RJ Bopara', role: 'allrounder', bowlerType: 'medium', leftHanded: false, age: 35 },
      { id: 15, fname: 'Alastair', lname: 'Cook', displayName: 'AN Cook', role: 'batsman', bowlerType: '', leftHanded: true, age: 34 },
      { id: 16, fname: 'Nick', lname: 'Browne', displayName: 'N Browne', role: 'batsman', bowlerType: '', leftHanded: true, age: 28 },
      { id: 17, fname: 'James', lname: 'Foster', displayName: 'J Foster', role: 'wicketkeeper', bowlerType: '', leftHanded: false, age: 36 },
      { id: 18, fname: 'Graham', lname: 'Napier', displayName: 'G Napier', role: 'allrounder', bowlerType: 'fast', leftHanded: false, age: 37 },
      { id: 19, fname: 'David', lname: 'Masters', displayName: 'D Masters', role: 'bowler', bowlerType: 'medium', leftHanded: false, age: 38 },
      { id: 20, fname: 'Jesse', lname: 'Ryder', displayName: 'J Ryder', role: 'allrounder', bowlerType: 'medium', leftHanded: true, age: 33 },
      { id: 21, fname: 'Mark', lname: 'Pettini', displayName: 'M Pettini', role: 'batsman', bowlerType: '', leftHanded: false, age: 35 },
      { id: 22, fname: 'Monty', lname: 'Panesar', displayName: 'M Panesar', role: 'bowler', bowlerType: 'spin', leftHanded: true, age: 34 }
    ]
  }
});


const [showEventForm, setShowEventForm] = useState(false);


  // Game state
  const [currentOver, setCurrentOver] = useState(1);
  const [currentBall, setCurrentBall] = useState(1);
  const [striker, setStriker] = useState('PJ Horton');
  const [nonStriker, setNonStriker] = useState('NJ Dexter');
  const [bowler, setBowler] = useState('AJ Robson');
  const [totalRuns, setTotalRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [ballTrajectory, setBallTrajectory] = useState(null);
  const [fielderMovement, setFielderMovement] = useState(null);
  const [currentEvent, setCurrentEvent] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [unsavedRuns, setUnsavedRuns] = useState('');
  const [unsavedEvent, setUnsavedEvent] = useState('');



{/* Add penalty run options state */}
const [penaltyRunOptions, setPenaltyRunOptions] = useState([
  { type: 'wide', label: 'Wide', runs: 1 },
  { type: 'noball', label: 'No Ball', runs: 1 },
  { type: 'bye', label: 'Bye', runs: 1 },
  { type: 'legbye', label: 'Leg Bye', runs: 1 },
  { type: 'penalty', label: 'Penalty Runs', runs: 5 }
]);

  // New player form
  const [newPlayer, setNewPlayer] = useState({
    fname: '',
    lname: '',
    displayName: '',
    role: 'batsman',
    bowlerType: '',
    leftHanded: false,
    age: 18,
    team: 'team1'
  });

  const svgRef = useRef(null);
  const [draggedFielder, setDraggedFielder] = useState(null);

  // Initialize fielders
  const [fielders, setFielders] = useState([
    { id: 1, name: 'AR Cook', x: 150, y: 50, color: 'bg-blue-600' },
    { id: 2, name: 'AJ Robson', x: 200, y: 80, color: 'bg-blue-600' },
    { id: 3, name: 'JW Porter', x: 220, y: 150, color: 'bg-blue-600' },
    { id: 4, name: 'RJ Bopara', x: 200, y: 220, color: 'bg-orange-400' },
    { id: 5, name: 'TE Westley', x: 150, y: 250, color: 'bg-green-500' },
    { id: 6, name: 'RT Doeschate', x: 100, y: 220, color: 'bg-blue-600' },
    { id: 7, name: 'JP Foster', x: 80, y: 150, color: 'bg-blue-600' },
    { id: 8, name: 'WB Rhodes', x: 100, y: 80, color: 'bg-blue-600' },
    { id: 9, name: 'GR Napier', x: 130, y: 100, color: 'bg-blue-600' },
    { id: 10, name: 'DM Lawrence', x: 170, y: 100, color: 'bg-blue-600' },
  ]);

  // Overs data
  const [overs, setOvers] = useState({});

  const showToast = (message, type = 'info') => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const openModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const addPlayer = () => {
    if (!newPlayer.fname || !newPlayer.lname) {
      showToast('Please enter first name and last name', 'error');
      return;
    }

    const playerId = Date.now();
    const displayName = newPlayer.displayName || `${newPlayer.fname[0]}${newPlayer.lname[0]} ${newPlayer.lname}`;
    
    setTeams(prev => ({
      ...prev,
      [newPlayer.team]: {
        ...prev[newPlayer.team],
        players: [...prev[newPlayer.team].players, {
          ...newPlayer,
          id: playerId,
          displayName
        }]
      }
    }));

    setNewPlayer({
      fname: '',
      lname: '',
      displayName: '',
      role: 'batsman',
      bowlerType: '',
      leftHanded: false,
      age: 18,
      team: 'team1'
    });

    showToast(`${displayName} added successfully!`, 'success');
  };

  const startMatch = () => {
    if (teams.team1.players.length < 11 || teams.team2.players.length < 11) {
      showToast('Each team needs at least 11 players', 'error');
      return;
    }
    setGameState('toss');
    openModal('tossDecision');
  };

  const handleTossDecision = (winner, decision) => {
    setMatchConfig(prev => ({ ...prev, tossWinner: winner, tossDecision: decision }));
    closeModal('tossDecision');
    setGameState('playing');
    showToast(`${winner} won the toss and chose to ${decision}`, 'success');
  };

  const eventTypes = [
    
  ];

  const handleFielderDrag = useCallback((e, fielderId) => {
    if (e.type === 'mousedown' || e.type === 'touchstart') {
      e.preventDefault();
      setDraggedFielder(fielderId);
    }
  }, []);

  const handleFielderMove = useCallback((e) => {
    if (!draggedFielder || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!clientX || !clientY) return;
    
    const x = ((clientX - rect.left) / rect.width) * 300;
    const y = ((clientY - rect.top) / rect.height) * 300;
    
    const centerX = 150, centerY = 150, radius = 140;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    
    let newX = x, newY = y;
    if (distance > radius) {
      const angle = Math.atan2(y - centerY, x - centerX);
      newX = centerX + Math.cos(angle) * radius;
      newY = centerY + Math.sin(angle) * radius;
    }
    
    setFielders(prev => prev.map(f => 
      f.id === draggedFielder ? { ...f, x: newX, y: newY } : f
    ));
  }, [draggedFielder]);

  const handleFielderDrop = useCallback(() => {
    setDraggedFielder(null);
  }, []);

  const handleBallClick = (e) => {
    if (gameState !== 'playing') return;
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 300;
    
    setBallTrajectory({ x, y });
  };

  const handleRunInput = (runs) => {
    setUnsavedRuns(runs);
    setIsSaved(false);
    
    let eventType = '';
    if (runs === 0) eventType = 'dot';
    else if (runs === 1) eventType = 'single';
    else if (runs === 2) eventType = 'two';
    else if (runs === 3) eventType = 'three';
    else if (runs === 4) eventType = 'four';
    else if (runs === 6) eventType = 'six';
    
    setUnsavedEvent(eventType);
    setCurrentEvent(eventType);
  };

  const saveBall = () => {
    if (unsavedRuns === '' && unsavedEvent === '') return;
    
    const newOvers = { ...overs };
    if (!newOvers[currentOver]) newOvers[currentOver] = [];
    if (!newOvers[currentOver][currentBall - 1]) {
      newOvers[currentOver][currentBall - 1] = { 
        ball: currentBall, 
        batsman: striker, 
        runs: '', 
        extra: '', 
        fielding: '', 
        event: '',
        ballTo: ballTrajectory,
        fielderTo: fielderMovement 
      };
    }
    
    newOvers[currentOver][currentBall - 1].runs = unsavedRuns;
    newOvers[currentOver][currentBall - 1].event = unsavedEvent;
    newOvers[currentOver][currentBall - 1].batsman = striker;
    
    setOvers(newOvers);
    setTotalRuns(prev => prev + parseInt(unsavedRuns || 0));
    
    if (unsavedEvent === 'wicket') {
      setWickets(prev => prev + 1);
    }
    
    if (parseInt(unsavedRuns || 0) % 2 === 1) {
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    }
    
    setIsSaved(true);
    showToast(`Ball ${currentOver}.${currentBall} saved successfully`, 'success');
  };

  const nextBall = () => {
    setBallTrajectory(null);
    setFielderMovement(null);
    setCurrentEvent('');
    setUnsavedRuns('');
    setUnsavedEvent('');
    setIsSaved(false);
    
    if (currentBall === 6) {
      setCurrentOver(prev => prev + 1);
      setCurrentBall(1);
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    } else {
      setCurrentBall(prev => prev + 1);
    }

    // Check for match end
    if (currentOver >= matchConfig.overs && currentBall === 6) {
      setGameState('finished');
      openModal('matchResult');
    }
  };

  const finishMatch = () => {
    setGameState('finished');
    openModal('matchResult');
    showToast('Match completed successfully!', 'success');
  };


  

  // Setup Screen Component
  const SetupScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Cricket Match Manager</h1>
          <p className="text-gray-600 mt-2">Professional Cricket Scoring & Management System</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team 1</label>
              <input
                type="text"
                value={matchConfig.team1}
                onChange={(e) => setMatchConfig(prev => ({ ...prev, team1: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="mt-2 text-sm text-gray-500">
                Players: {teams.team1.players.length}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team 2</label>
              <input
                type="text"
                value={matchConfig.team2}
                onChange={(e) => setMatchConfig(prev => ({ ...prev, team2: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="mt-2 text-sm text-gray-500">
                Players: {teams.team2.players.length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Match Type</label>
              <select
                value={matchConfig.matchType}
                onChange={(e) => {
                  const type = e.target.value;
                  const oversMap = { 'T20': 20, 'ODI': 50, 'Test': 90, 'T10': 10 };
                  setMatchConfig(prev => ({ 
                    ...prev, 
                    matchType: type, 
                    overs: oversMap[type] || 20 
                  }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="T20">T20 (20 overs)</option>
                <option value="ODI">ODI (50 overs)</option>
                <option value="Test">Test Match (90 overs)</option>
                <option value="T10">T10 (10 overs)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Overs</label>
              <input
                type="number"
                value={matchConfig.overs}
                onChange={(e) => setMatchConfig(prev => ({ ...prev, overs: parseInt(e.target.value) || 20 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                min="1"
                max="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
            <input
              type="text"
              value={matchConfig.venue}
              onChange={(e) => setMatchConfig(prev => ({ ...prev, venue: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Match venue"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => openModal('playerManagement')}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>Manage Players</span>
            </button>
            <button
              onClick={startMatch}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Trophy className="w-5 h-5" />
              <span>Start Match</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Player Management Modal Content
  const PlayerManagementContent = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
        <h3 className="font-bold mb-4 flex items-center text-lg">
          <UserPlus className="w-6 h-6 mr-2 text-green-600" />
          Add New Player
        </h3>
        
        <>
          <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={newPlayer.fname}
            onChange={(e) => setNewPlayer(prev => ({ ...prev, fname: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={newPlayer.lname}
            onChange={(e) => setNewPlayer(prev => ({ ...prev, lname: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Display Name (optional)"
            value={newPlayer.displayName}
            onChange={(e) => setNewPlayer(prev => ({ ...prev, displayName: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Age"
            value={newPlayer.age}
            onChange={(e) => setNewPlayer(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="16"
            max="50"
          />
          <select
            value={newPlayer.team}
            onChange={(e) => setNewPlayer(prev => ({ ...prev, team: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="team1">{teams.team1.name}</option>
            <option value="team2">{teams.team2.name}</option>
          </select>
          <select
            value={newPlayer.role}
            onChange={(e) => setNewPlayer(prev => ({ ...prev, role: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="batsman">Batsman</option>
            <option value="bowler">Bowler</option>
            <option value="allrounder">All-rounder</option>
            <option value="wicketkeeper">Wicket Keeper</option>
          </select>
        </div>
        
        {(newPlayer.role === 'bowler' || newPlayer.role === 'allrounder') && (
          <div className="mt-4">
            <select
              value={newPlayer.bowlerType}
              onChange={(e) => setNewPlayer(prev => ({ ...prev, bowlerType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Bowling Type</option>
              <option value="fast">Fast Bowler</option>
              <option value="medium">Medium Pace</option>
              <option value="spin">Spin Bowler</option>
              <option value="leg-spin">Leg Spin</option>
              <option value="off-spin">Off Spin</option>
            </select>
          </div>
        )}
        
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="leftHanded"
            checked={newPlayer.leftHanded}
            onChange={(e) => setNewPlayer(prev => ({ ...prev, leftHanded: e.target.checked }))}
            className="mr-2 w-4 h-4 text-blue-600"
          />
          <label htmlFor="leftHanded" className="text-sm font-medium">Left-handed batsman</label>
        </div>
        
        <button
        type='button'
          onClick={addPlayer}
          className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Player</span>
        </button>
        </>
      </div>

      {/* Teams Display */}
      <div className="grid grid-cols-2 gap-6">
        {Object.entries(teams).map(([teamKey, team]) => (
          <div key={teamKey} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <h4 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              {team.name}
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {team.players.map(player => (
                <div key={player.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  <div className="font-semibold text-gray-800 flex items-center justify-between">
                    <span>{player.displayName}</span>
                    {player.leftHanded && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">LH</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div className="flex justify-between">
                      <span className="capitalize">{player.role}</span>
                      <span>Age {player.age}</span>
                    </div>
                    {player.bowlerType && (
                      <div className="text-green-600 mt-1 capitalize">{player.bowlerType} bowler</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Toss Decision Modal Content
  const TossDecisionContent = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🏏</div>
      <h3 className="text-2xl font-bold">Toss Time!</h3>
      <p className="text-gray-600">Who won the toss and what did they choose?</p>
      
      <div className="grid grid-cols-2 gap-4">
        {[matchConfig.team1, matchConfig.team2].map(team => (
          <div key={team} className="space-y-3 bg-gray-50 rounded-lg p-4">
            <h4 className="font-bold text-lg text-gray-800">{team}</h4>
            <button
              onClick={() => handleTossDecision(team, 'bat')}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Target className="w-5 h-5" />
              <span>Won Toss - Bat First</span>
            </button>
            <button
              onClick={() => handleTossDecision(team, 'bowl')}
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

  // Match Result Modal Content
  const MatchResultContent = () => {
    const winner = totalRuns > 150 ? matchConfig.team1 : matchConfig.team2;
    const margin = Math.abs(totalRuns - 150);
    
    return (
      <div className="text-center space-y-6">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
        <h3 className="text-3xl font-bold">Match Complete!</h3>
        
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 space-y-4">
          <div className="text-2xl font-bold text-green-600">{winner} Wins!</div>
          <div className="text-lg">by {margin} runs</div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center bg-white rounded-lg p-4">
              <div className="text-xl font-bold">{matchConfig.team1}</div>
              <div className="text-2xl text-blue-600">{totalRuns}/{wickets}</div>
              <div className="text-sm text-gray-600">({currentOver}.{currentBall} ov)</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4">
              <div className="text-xl font-bold">{matchConfig.team2}</div>
              <div className="text-2xl text-orange-600">Yet to bat</div>
              <div className="text-sm text-gray-600">({matchConfig.overs}.0 ov)</div>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => {
            closeModal('matchResult');
            setGameState('setup');
            setTotalRuns(0);
            setWickets(0);
            setCurrentOver(1);
            setCurrentBall(1);
            setOvers({});
          }}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          New Match
        </button>
      </div>
    );
  };

  // Playing Screen Component
  const PlayingScreen = () => (
    <div className=" bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {matchConfig.team1} vs {matchConfig.team2} • {new Date().toLocaleDateString()} • {matchConfig.venue} • {matchConfig.matchType}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => openModal('playerManagement')}
              className="flex items-center space-x-2 bg-blue-600 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Players</span>
            </button>
            <button
              onClick={finishMatch}
              className="flex items-center space-x-2 bg-red-600 px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span>End Match</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        {/* Score Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{matchConfig.team1}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Striker:</span>
                  <select 
                    value={striker} 
                    onChange={(e) => setStriker(e.target.value)}
                    className="border border-gray-400 rounded-lg px-3 py-2 font-bold bg-yellow-400 text-black focus:ring-2 focus:ring-yellow-500"
                  >
                    {teams.team1.players.filter(p => p.role === 'batsman' || p.role === 'allrounder').map(p => (
                      <option key={p.id} value={p.displayName}>{p.displayName}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Non-Striker:</span>
                  <select 
                    value={nonStriker} 
                    onChange={(e) => setNonStriker(e.target.value)}
                    className="border border-gray-400 rounded-lg px-3 py-2 font-bold bg-blue-400 text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {teams.team1.players.filter(p => p.role === 'batsman' || p.role === 'allrounder').map(p => (
                      <option key={p.id} value={p.displayName}>{p.displayName}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={() => {
                    const temp = striker;
                    setStriker(nonStriker);
                    setNonStriker(temp);
                    showToast('Batsmen swapped', 'info');
                  }}
                  className="flex items-center space-x-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Swap</span>
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Bowler:</span>
                  <select 
                    value={bowler} 
                    onChange={(e) => setBowler(e.target.value)}
                    className="border border-gray-400 rounded-lg px-3 py-2 font-bold bg-red-400 text-white focus:ring-2 focus:ring-red-500"
                  >
                    {teams.team2.players.filter(p => p.role === 'bowler' || p.role === 'allrounder').map(p => (
                      <option key={p.id} value={p.displayName}>{p.displayName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-gray-800">{totalRuns}/{wickets}</div>
              <div className="text-lg text-gray-600">({currentOver}.{currentBall} / {matchConfig.overs} ov)</div>
              <div className="text-sm text-gray-500 mt-1">
                {matchConfig.tossWinner} won toss, chose to {matchConfig.tossDecision}
              </div>
            </div>
          </div>

          {/* Over Navigation */}
          {/* <div className="flex items-center justify-between bg-white rounded-xl shadow-md px-6 py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  if (currentBall === 1 && currentOver > 1) {
                    setCurrentOver(prev => prev - 1);
                    setCurrentBall(6);
                  } else if (currentBall > 1) {
                    setCurrentBall(prev => prev - 1);
                  }
                }} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-blue-500" />
              </button>
              <span className="text-2xl font-bold text-gray-800">OVER {currentOver}.{currentBall}</span>
              <button onClick={nextBall} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-6 h-6 text-blue-500" />
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                Run Rate: {((totalRuns / ((currentOver - 1) + (currentBall / 6))) || 0).toFixed(2)}
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="text-sm text-gray-600">
                Required: {((matchConfig.overs * 6) || 0).toFixed(1)} RPO
              </div>
            </div>
          </div> */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow-md px-6 py-4">
  <div className="flex items-center space-x-4">
    <button 
      onClick={() => {
        if (currentBall === 1 && currentOver > 1) {
          setCurrentOver(prev => prev - 1);
          setCurrentBall(6);
        } else if (currentBall > 1) {
          setCurrentBall(prev => prev - 1);
        }
      }} 
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <ChevronLeft className="w-6 h-6 text-blue-500" />
    </button>
    <span className="text-2xl font-bold text-gray-800">OVER {currentOver}.{currentBall}</span>
    <button onClick={nextBall} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
      <ChevronRight className="w-6 h-6 text-blue-500" />
    </button>
  </div>
  <div className="flex items-center space-x-6">
    {/* Batsman Info */}
    <div className="text-sm text-gray-600">
      <div className="font-semibold">Striker: {striker}</div>
      <div className="text-xs">
        {(() => {
          const batsman = teams.team1.players.find(p => p.displayName === striker);
          return batsman ? `${batsman.battingType === 'left' ? 'Left-handed' : 'Right-handed'} ${batsman.role}` : '';
        })()}
      </div>
    </div>
    
    {/* Bowler Info */}
    <div className="text-sm text-gray-600">
      <div className="font-semibold">Bowler: {bowler}</div>
      <div className="text-xs">
        {(() => {
          const bowlerInfo = teams.team2.players.find(p => p.displayName === bowler);
          return bowlerInfo && bowlerInfo.bowlingType ? 
            `${bowlerInfo.bowlingType.charAt(0).toUpperCase() + bowlerInfo.bowlingType.slice(1)} ${bowlerInfo.role}` : 
            (bowlerInfo ? bowlerInfo.role : '');
        })()}
      </div>
    </div>
    
    <div className="h-6 w-px bg-gray-300"></div>
    
    {/* Match Stats */}
    <div className="text-sm text-gray-600">
      Run Rate: {((totalRuns / ((currentOver - 1) + (currentBall / 6))) || 0).toFixed(2)}
    </div>
    <div className="h-6 w-px bg-gray-300"></div>
    <div className="text-sm text-gray-600">
      Required: {((matchConfig.overs * 6) || 0).toFixed(1)} RPO
    </div>
  </div>
</div>
        </div>

        {/* Main Playing Area */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 ">
          {/* Ball Input Panel */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Current Ball
            </h3>
            
            {/* Runs Input */}
            {/* <div className="mb-6">
              <h4 className="font-semibold mb-3 text-gray-700">Runs</h4>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, "?"].map(run => (
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
              </div>
              {unsavedRuns !== '' && !isSaved && (
                <div className="mt-3 text-sm text-orange-600 font-semibold bg-orange-50 p-2 rounded-lg">
                  Unsaved: {unsavedRuns} runs - Click Save to confirm
                </div>
              )}
            </div> */}

            <div className="mb-6">
  <h4 className="font-semibold mb-3 text-gray-700">Runs</h4>
  <div className="grid grid-cols-4 gap-2">
    {[0, 1, 2, 3, 4, 5, 6, "?"].map(run => (
      <button
        key={run}
        onClick={() => run === "?" ? openModal('extraRuns') : handleRunInput(run)}
        className={`p-3 rounded-lg font-bold transition-all duration-200 ${
          unsavedRuns === run 
            ? 'bg-blue-500 text-white scale-105 shadow-lg' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        }`}
      >
        {run}
      </button>
    ))}
  </div>
  {unsavedRuns !== '' && !isSaved && (
    <div className="mt-3 text-sm text-orange-600 font-semibold bg-orange-50 p-2 rounded-lg">
      Unsaved: {unsavedRuns} runs - Click Save to confirm
    </div>
  )}
</div>



{/* Add this modal for extra runs */}
<Modal 
  isOpen={modals.extraRuns} 
  onClose={() => closeModal('extraRuns')} 
  title="Extra Runs"
  size="sm"
>
  <div className="space-y-4">
    <p className="text-gray-700">Select type of extra runs:</p>
    <div className="grid grid-cols-2 gap-2">
      {penaltyRunOptions.map(option => (
        <button
          key={option.type}
          onClick={() => {
            handleRunInput(option.runs);
            setUnsavedEvent(option.type);
            setCurrentEvent(option.type);
            closeModal('extraRuns');
          }}
          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors"
        >
          {option.label} (+{option.runs})
        </button>
      ))}
    </div>
    <div className="pt-4 border-t border-gray-200">
      <p className="text-gray-700 mb-2">Or enter custom runs:</p>
      <div className="flex space-x-2">
        <input
          type="number"
          min="1"
          max="10"
          placeholder="Runs"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          onChange={(e) => {
            const runs = parseInt(e.target.value) || 0;
            setUnsavedRuns(runs);
            setUnsavedEvent('penalty');
            setCurrentEvent('penalty');
          }}
        />
        <button
          onClick={() => closeModal('extraRuns')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</Modal>

            {/* Events */}
            <div className="mb-6">
  <div className="flex justify-between items-center mb-3">
    <h4 className="font-semibold text-gray-700">Events</h4>
    <button 
      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      onClick={() => setShowEventForm(true)}
    >
      Add Event
    </button>
  </div>
  <div className="space-y-2 max-h-48 overflow-y-auto">
    {/* Event items will be rendered here */}
  </div>
</div>

            <div className="space-y-3">
              <button
                onClick={saveBall}
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
                onClick={nextBall}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <ChevronRight className="w-5 h-5" />
                <span>Next Ball</span>
              </button>
            </div>
          </div>

          <FieldSetGround />

        </div>
      </div>
        <CricketFieldingTracker />
    </div>
  );

  if (gameState === 'setup') {
    return (
      <>
        <SetupScreen />
        <Modal
          isOpen={modals.playerManagement}
          onClose={() => closeModal('playerManagement')}
          title="Player Management"
          size="xl"
        >
          <PlayerManagementContent />
        </Modal>
        <Modal
          isOpen={modals.tossDecision}
          onClose={() => closeModal('tossDecision')}
          title="Toss Decision"
          size="md"
        >
          <TossDecisionContent />
        </Modal>
        <Toast {...toast} onClose={hideToast} />
      </>
    );
  }

  if (gameState === 'playing') {
    return (
      <>
        <PlayingScreen />
        <Modal
          isOpen={modals.playerManagement}
          onClose={() => closeModal('playerManagement')}
          title="Player Management"
          size="xl"
        >
          <PlayerManagementContent />
        </Modal>
        <Modal
          isOpen={modals.matchResult}
          onClose={() => closeModal('matchResult')}
          title="Match Result"
          size="lg"
        >
          <MatchResultContent />
        </Modal>
        <Toast {...toast} onClose={hideToast} />
        
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-blue-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Match Complete!</h1>
          <button
            onClick={() => setGameState('setup')}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Start New Match
          </button>
        </div>
      </div>
      <Toast {...toast} onClose={hideToast} />
    </>
  );
};

export default AdvancedCricketManager;