import { useState, useRef, useEffect } from 'react';
import { cricketAPI, getPlayersByTeam, getTeams } from '../services/api';

const FieldSetGround = ({ matchConfig, teams }) => {
  const [fielders, setFielders] = useState([
    { id: 1, name: 'Keeper', x: 150, y: 110, color: 'bg-red-500', type: 'keeper', playerId: null, playerName: '' },
    { id: 2, name: 'Slip 1', x: 130, y: 120, color: 'bg-blue-600', type: 'fielder', playerId: null, playerName: '' },
    { id: 3, name: 'Slip 2', x: 110, y: 130, color: 'bg-blue-700', type: 'fielder', playerId: null, playerName: '' },
    { id: 4, name: 'Gully', x: 90, y: 140, color: 'bg-blue-800', type: 'fielder', playerId: null, playerName: '' },
    { id: 5, name: 'Point', x: 70, y: 170, color: 'bg-indigo-500', type: 'fielder', playerId: null, playerName: '' },
    { id: 6, name: 'Cover', x: 130, y: 190, color: 'bg-indigo-600', type: 'fielder', playerId: null, playerName: '' },
    { id: 7, name: 'Mid-off', x: 180, y: 150, color: 'bg-indigo-700', type: 'fielder', playerId: null, playerName: '' },
    { id: 8, name: 'Mid-on', x: 180, y: 200, color: 'bg-purple-500', type: 'fielder', playerId: null, playerName: '' },
    { id: 9, name: 'Mid-wicket', x: 220, y: 190, color: 'bg-purple-600', type: 'fielder', playerId: null, playerName: '' },
    { id: 10, name: 'Square Leg', x: 220, y: 120, color: 'bg-purple-700', type: 'fielder', playerId: null, playerName: '' },
    { id: 11, name: 'Fine Leg', x: 230, y: 80, color: 'bg-purple-800', type: 'fielder', playerId: null, playerName: '' }
  ]);

  const [bowler, setBowler] = useState({ x: 150, y: 250, color: 'bg-black', type: 'bowler', playerId: null, playerName: '' });

  // State for ball trajectory
  const [ballTrajectory, setBallTrajectory] = useState(null);
  const [fielderMovement, setFielderMovement] = useState(null);
  const [draggingFielder, setDraggingFielder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedFielder, setSelectedFielder] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [fieldingTeamPlayers, setFieldingTeamPlayers] = useState([]);
  const [bowlingTeamPlayers, setBowlingTeamPlayers] = useState([]);
  const svgRef = useRef(null);

  // Bowler types and their field settings
  const bowlerTypes = [
    { id: 'fast', name: 'Fast Bowler', fieldPreset: 'aggressive' },
    { id: 'medium', name: 'Medium Pacer', fieldPreset: 'standard' },
    { id: 'spin', name: 'Spinner', fieldPreset: 'defensive' },
    { id: 'legspin', name: 'Leg Spinner', fieldPreset: 'legside' },
    { id: 'offspin', name: 'Off Spinner', fieldPreset: 'offside' }
  ];

  // Batsman types
  const batsmanTypes = [
    { id: 'rhb', name: 'Right Handed Batsman' },
    { id: 'lhb', name: 'Left Handed Batsman' }
  ];

  // Power play options
  const powerPlays = [
    { id: 'pp1', name: 'Power Play 1' },
    { id: 'pp2', name: 'Power Play 2' },
    { id: 'pp3', name: 'Power Play 3' },
    { id: 'none', name: 'No Power Play' }
  ];

  const [selectedBowler, setSelectedBowler] = useState('fast');
  const [selectedBatsman, setSelectedBatsman] = useState('rhb');
  const [selectedPowerPlay, setSelectedPowerPlay] = useState('pp1');
  const [selectedFieldPreset, setSelectedFieldPreset] = useState('aggressive');

  // Fetch players data
  const fetchPlayers = async () => {
    if (!matchConfig.id || !teams.team1.id || !teams.team2.id) return;

    try {
      setIsLoading(true);
      
      // Get batting and bowling teams based on current innings
      const battingTeam = getBattingTeam();
      const bowlingTeam = getBowlingTeam();
      
      // Fetch players for both teams
      const [battingTeamResponse, bowlingTeamResponse] = await Promise.all([
        getPlayersByTeam(battingTeam.id),
        getPlayersByTeam(bowlingTeam.id)
      ]);

      const battingPlayers = battingTeamResponse.data.results || battingTeamResponse.data || [];
      const bowlingPlayers = bowlingTeamResponse.data.results || bowlingTeamResponse.data || [];

      setFieldingTeamPlayers(bowlingPlayers);
      setBowlingTeamPlayers(bowlingPlayers);
      setAvailablePlayers(bowlingPlayers); // Default to bowling team for fielders

    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get batting team based on toss decision
  const getBattingTeam = () => {
    if (matchConfig.currentInnings === 1) {
      return matchConfig.tossDecision === 'bat' ? 
        (matchConfig.tossWinner === 'team1' ? teams.team1 : teams.team2) :
        (matchConfig.tossWinner === 'team1' ? teams.team2 : teams.team1);
    } else {
      return matchConfig.currentInnings === 2 ?
        (matchConfig.tossDecision === 'bat' ? 
          (matchConfig.tossWinner === 'team1' ? teams.team2 : teams.team1) :
          (matchConfig.tossWinner === 'team1' ? teams.team1 : teams.team2)) : teams.team1;
    }
  };

  // Get bowling team
  const getBowlingTeam = () => {
    const battingTeam = getBattingTeam();
    return battingTeam.id === teams.team1.id ? teams.team2 : teams.team1;
  };

  useEffect(() => {
    fetchPlayers();
  }, [matchConfig.id, teams.team1.id, teams.team2.id, matchConfig.currentInnings]);

  // Field presets for different scenarios (updated with type field)
  const fieldPresets = {
    // Power Play 1 - Right Handed Batsman & Pacers
    'pp1_rhb_fast': [
      { id: 1, name: 'Keeper', x: 150, y: 110, color: 'bg-red-500', type: 'keeper', playerId: null, playerName: '' },
      { id: 2, name: 'Slip 1', x: 130, y: 120, color: 'bg-blue-600', type: 'fielder', playerId: null, playerName: '' },
      { id: 3, name: 'Slip 2', x: 110, y: 130, color: 'bg-blue-700', type: 'fielder', playerId: null, playerName: '' },
      { id: 4, name: 'Third Man', x: 70, y: 80, color: 'bg-blue-800', type: 'fielder', playerId: null, playerName: '' },
      { id: 5, name: 'Point', x: 70, y: 170, color: 'bg-indigo-500', type: 'fielder', playerId: null, playerName: '' },
      { id: 6, name: 'Cover', x: 130, y: 190, color: 'bg-indigo-600', type: 'fielder', playerId: null, playerName: '' },
      { id: 7, name: 'Mid-off', x: 180, y: 150, color: 'bg-indigo-700', type: 'fielder', playerId: null, playerName: '' },
      { id: 8, name: 'Mid-on', x: 180, y: 200, color: 'bg-purple-500', type: 'fielder', playerId: null, playerName: '' },
      { id: 9, name: 'Mid-wicket', x: 220, y: 190, color: 'bg-purple-600', type: 'fielder', playerId: null, playerName: '' },
      { id: 10, name: 'Square Leg', x: 220, y: 120, color: 'bg-purple-700', type: 'fielder', playerId: null, playerName: '' },
      { id: 11, name: 'Fine Leg', x: 230, y: 80, color: 'bg-purple-800', type: 'fielder', playerId: null, playerName: '' }
    ],
    // Power Play 1 - Left Handed Batsman & Pacers
    'pp1_lhb_fast': [
      { id: 1, name: 'Keeper', x: 150, y: 110, color: 'bg-red-500', type: 'keeper', playerId: null, playerName: '' },
      { id: 2, name: 'Slip 1', x: 170, y: 120, color: 'bg-blue-600', type: 'fielder', playerId: null, playerName: '' },
      { id: 3, name: 'Slip 2', x: 190, y: 130, color: 'bg-blue-700', type: 'fielder', playerId: null, playerName: '' },
      { id: 4, name: 'Third Man', x: 230, y: 80, color: 'bg-blue-800', type: 'fielder', playerId: null, playerName: '' },
      { id: 5, name: 'Point', x: 230, y: 170, color: 'bg-indigo-500', type: 'fielder', playerId: null, playerName: '' },
      { id: 6, name: 'Cover', x: 170, y: 190, color: 'bg-indigo-600', type: 'fielder', playerId: null, playerName: '' },
      { id: 7, name: 'Mid-off', x: 120, y: 150, color: 'bg-indigo-700', type: 'fielder', playerId: null, playerName: '' },
      { id: 8, name: 'Mid-on', x: 120, y: 200, color: 'bg-purple-500', type: 'fielder', playerId: null, playerName: '' },
      { id: 9, name: 'Mid-wicket', x: 80, y: 190, color: 'bg-purple-600', type: 'fielder', playerId: null, playerName: '' },
      { id: 10, name: 'Square Leg', x: 80, y: 120, color: 'bg-purple-700', type: 'fielder', playerId: null, playerName: '' },
      { id: 11, name: 'Fine Leg', x: 70, y: 80, color: 'bg-purple-800', type: 'fielder', playerId: null, playerName: '' }
    ],
    // Default field settings (for non-power play)
    aggressive: [
      { id: 1, name: 'Keeper', x: 150, y: 110, color: 'bg-red-500', type: 'keeper', playerId: null, playerName: '' },
      { id: 2, name: 'Slip 1', x: 130, y: 120, color: 'bg-blue-600', type: 'fielder', playerId: null, playerName: '' },
      { id: 3, name: 'Slip 2', x: 110, y: 130, color: 'bg-blue-700', type: 'fielder', playerId: null, playerName: '' },
      { id: 4, name: 'Gully', x: 90, y: 140, color: 'bg-blue-800', type: 'fielder', playerId: null, playerName: '' },
      { id: 5, name: 'Point', x: 70, y: 170, color: 'bg-indigo-500', type: 'fielder', playerId: null, playerName: '' },
      { id: 6, name: 'Cover', x: 130, y: 190, color: 'bg-indigo-600', type: 'fielder', playerId: null, playerName: '' },
      { id: 7, name: 'Mid-off', x: 180, y: 150, color: 'bg-indigo-700', type: 'fielder', playerId: null, playerName: '' },
      { id: 8, name: 'Mid-on', x: 180, y: 200, color: 'bg-purple-500', type: 'fielder', playerId: null, playerName: '' },
      { id: 9, name: 'Mid-wicket', x: 220, y: 190, color: 'bg-purple-600', type: 'fielder', playerId: null, playerName: '' },
      { id: 10, name: 'Square Leg', x: 220, y: 120, color: 'bg-purple-700', type: 'fielder', playerId: null, playerName: '' },
      { id: 11, name: 'Fine Leg', x: 230, y: 80, color: 'bg-purple-800', type: 'fielder', playerId: null, playerName: '' }
    ],
    defensive: [
      { id: 1, name: 'Keeper', x: 150, y: 110, color: 'bg-red-500', type: 'keeper', playerId: null, playerName: '' },
      { id: 2, name: 'Slip 1', x: 140, y: 130, color: 'bg-blue-600', type: 'fielder', playerId: null, playerName: '' },
      { id: 3, name: 'Slip 2', x: 120, y: 140, color: 'bg-blue-700', type: 'fielder', playerId: null, playerName: '' },
      { id: 4, name: 'Gully', x: 100, y: 150, color: 'bg-blue-800', type: 'fielder', playerId: null, playerName: '' },
      { id: 5, name: 'Point', x: 80, y: 180, color: 'bg-indigo-500', type: 'fielder', playerId: null, playerName: '' },
      { id: 6, name: 'Cover', x: 140, y: 200, color: 'bg-indigo-600', type: 'fielder', playerId: null, playerName: '' },
      { id: 7, name: 'Mid-off', x: 190, y: 160, color: 'bg-indigo-700', type: 'fielder', playerId: null, playerName: '' },
      { id: 8, name: 'Mid-on', x: 190, y: 210, color: 'bg-purple-500', type: 'fielder', playerId: null, playerName: '' },
      { id: 9, name: 'Mid-wicket', x: 230, y: 200, color: 'bg-purple-600', type: 'fielder', playerId: null, playerName: '' },
      { id: 10, name: 'Square Leg', x: 230, y: 130, color: 'bg-purple-700', type: 'fielder', playerId: null, playerName: '' },
      { id: 11, name: 'Fine Leg', x: 240, y: 90, color: 'bg-purple-800', type: 'fielder', playerId: null, playerName: '' }
    ],
  };

  // Check if a point is within the field boundaries
  const isPointInField = (x, y) => {
    const centerX = 150;
    const centerY = 150;
    const radius = 140;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    return distance <= radius;
  };

  // Handle ball click to set trajectory
  const handleBallClick = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isPointInField(x, y)) {
      setBallTrajectory({ x, y });
    }
  };

  // Handle fielder drag start
  const handleFielderDrag = (e, id) => {
    e.preventDefault();
    setDraggingFielder(id);
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFielderMovement({ x, y });
  };

  // Handle fielder movement
  const handleFielderMove = (e) => {
    if (!draggingFielder) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isPointInField(x, y)) {
      setFielderMovement({ x, y });
    }
  };

  // Handle fielder drop
  const handleFielderDrop = () => {
    if (!draggingFielder || !fielderMovement) return;
    
    if (isPointInField(fielderMovement.x, fielderMovement.y)) {
      setFielders(fielders.map(fielder => 
        fielder.id === draggingFielder 
          ? { ...fielder, x: fielderMovement.x, y: fielderMovement.y }
          : fielder
      ));
    }
    
    setDraggingFielder(null);
    setFielderMovement(null);
  };

  // Apply field settings based on selected options
  const applyFieldSettings = () => {
    let presetKey = '';
    
    if (selectedPowerPlay !== 'none') {
      const isSpinner = selectedBowler === 'spin' || selectedBowler === 'legspin' || selectedBowler === 'offspin';
      const bowlerType = isSpinner ? 'spin' : selectedBowler;
      presetKey = `${selectedPowerPlay}_${selectedBatsman}_${bowlerType}`;
    } else {
      presetKey = selectedFieldPreset;
    }
    
    if (fieldPresets[presetKey]) {
      setFielders(fieldPresets[presetKey]);
    } else {
      setFielders(fieldPresets.aggressive);
    }
    
    setBallTrajectory(null);
  };

  // Handle player assignment to field position
  const handleAssignPlayer = (fielderId, player) => {
    setFielders(fielders.map(fielder => 
      fielder.id === fielderId 
        ? { 
            ...fielder, 
            playerId: player.id, 
            playerName: player.display_name || `${player.fname} ${player.lname}` 
          }
        : fielder
    ));
    setShowPlayerModal(false);
    setSelectedFielder(null);
  };

  // Handle bowler assignment
  const handleAssignBowler = (player) => {
    setBowler({ 
      ...bowler, 
      playerId: player.id, 
      playerName: player.display_name || `${player.fname} ${player.lname}` 
    });
    setShowPlayerModal(false);
    setSelectedFielder(null);
  };

  // Open player selection modal
  const openPlayerModal = (fielderId, isBowler = false) => {
    setSelectedFielder({ id: fielderId, isBowler });
    setShowPlayerModal(true);
  };

  // Function to send field configuration to backend
  const saveFieldConfiguration = async () => {
    setIsLoading(true);
    try {
      const fieldConfiguration = {
        match_id: matchConfig.id,
        inning_number: matchConfig.currentInnings,
        batsman_type: selectedBatsman,
        bowler_type: selectedBowler,
        power_play: selectedPowerPlay,
        field_preset: selectedFieldPreset,
        fielders: fielders,
        bowler: bowler,
        ball_trajectory: ballTrajectory,
        timestamp: new Date().toISOString()
      };

      // Save to backend - you'll need to create this endpoint
      const response = await cricketAPI.post('/field-configurations/', fieldConfiguration);
      
      console.log('Field configuration saved:', response.data);
      alert('Field configuration saved successfully!');
      
    } catch (error) {
      console.error('Error saving field configuration:', error);
      alert('Failed to save field configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved field configuration
  const loadFieldConfiguration = async () => {
    if (!matchConfig.id) return;
    
    setIsLoading(true);
    try {
      const response = await cricketAPI.get(`/field-configurations/?match_id=${matchConfig.id}&inning_number=${matchConfig.currentInnings}`);
      const savedConfig = response.data.results?.[0] || response.data?.[0];
      
      if (savedConfig) {
        setFielders(savedConfig.fielders || fielders);
        setBowler(savedConfig.bowler || bowler);
        setSelectedBatsman(savedConfig.batsman_type || selectedBatsman);
        setSelectedBowler(savedConfig.bowler_type || selectedBowler);
        setSelectedPowerPlay(savedConfig.power_play || selectedPowerPlay);
        setSelectedFieldPreset(savedConfig.field_preset || selectedFieldPreset);
        setBallTrajectory(savedConfig.ball_trajectory || null);
        
        alert('Field configuration loaded successfully!');
      } else {
        alert('No saved field configuration found for this inning.');
      }
    } catch (error) {
      console.error('Error loading field configuration:', error);
      alert('Failed to load field configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get color for fielder based on type and color class
  const getFielderColor = (fielder) => {
    if (fielder.type === 'keeper') return '#ef4444';
    if (fielder.type === 'bowler') return '#000000';
    return fielder.color.includes('blue') ? '#3b82f6' : 
           fielder.color.includes('indigo') ? '#6366f1' : 
           fielder.color.includes('purple') ? '#8b5cf6' : '#22c55e';
  };

  // Get display name for fielder
  const getFielderDisplayName = (fielder) => {
    if (fielder.playerName) {
      return fielder.playerName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return fielder.name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="xl:col-span-3 bg-white rounded-xl shadow-md p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Field Position Configuration
      </h3>
      
      {/* Team Information */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Batting Team:</span> {getBattingTeam().name}
          </div>
          <div>
            <span className="font-semibold">Bowling Team:</span> {getBowlingTeam().name}
          </div>
          <div>
            <span className="font-semibold">Innings:</span> {matchConfig.currentInnings}
          </div>
          <div>
            <span className="font-semibold">Available Players:</span> {availablePlayers.length}
          </div>
        </div>
      </div>
      
      {/* Configuration Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Batsman Type</label>
          <select 
            value={selectedBatsman}
            onChange={(e) => setSelectedBatsman(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            {batsmanTypes.map((batsman) => (
              <option key={batsman.id} value={batsman.id}>{batsman.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bowler Type</label>
          <select 
            value={selectedBowler}
            onChange={(e) => setSelectedBowler(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            {bowlerTypes.map((bowler) => (
              <option key={bowler.id} value={bowler.id}>{bowler.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Power Play</label>
          <select 
            value={selectedPowerPlay}
            onChange={(e) => setSelectedPowerPlay(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            {powerPlays.map((pp) => (
              <option key={pp.id} value={pp.id}>{pp.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Field Preset</label>
          <select 
            value={selectedFieldPreset}
            onChange={(e) => setSelectedFieldPreset(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="aggressive">Aggressive Field</option>
            <option value="defensive">Defensive Field</option>
            <option value="standard">Standard Field</option>
            <option value="legside">Leg Side Focus</option>
            <option value="offside">Off Side Focus</option>
          </select>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button 
          onClick={applyFieldSettings}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-md flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Apply Field Settings
        </button>
        
        <button 
          onClick={loadFieldConfiguration}
          disabled={isLoading}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-md flex items-center disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Load Saved Field
        </button>
        
        <button 
          onClick={saveFieldConfiguration}
          disabled={isLoading}
          className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors shadow-md flex items-center disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Field
            </>
          )}
        </button>
      </div>
      
      {/* Field Visualization */}
      <div className="relative mb-6">
        <svg 
          ref={svgRef}
          viewBox="0 0 300 300" 
          className="w-full h-80 border-2 border-gray-300 rounded-lg cursor-crosshair bg-green-50"
          onClick={handleBallClick}
          onMouseMove={handleFielderMove}
          onMouseUp={handleFielderDrop}
        >
          {/* Field boundaries */}
          <circle cx="150" cy="150" r="140" fill="#e5f3e5" stroke="#22c55e" strokeWidth="3" />
          <circle cx="150" cy="150" r="80" fill="#d1f2d1" stroke="#22c55e" strokeWidth="2" strokeDasharray="5,5" />
          
          {/* Pitch */}
          <rect x="140" y="120" width="20" height="60" fill="#8b5a3c" stroke="#654321" strokeWidth="1" />
          
          {/* Stumps */}
          <circle cx="150" cy="130" r="3" fill="#000" stroke="#fff" strokeWidth="1" />
          <circle cx="150" cy="170" r="3" fill="#000" stroke="#fff" strokeWidth="1" />
          
          {/* Bowler */}
          <g>
            <circle
              cx={bowler.x}
              cy={bowler.y}
              r="10"
              fill="#000000"
              stroke="#fff"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80"
              onClick={() => openPlayerModal(null, true)}
            />
            <text
              x={bowler.x}
              y={bowler.y - 15}
              textAnchor="middle"
              className="text-xs fill-gray-700 pointer-events-none font-semibold"
            >
              {bowler.playerName ? getFielderDisplayName(bowler) : 'BOWL'}
            </text>
          </g>
          
          {/* Leg side and Off side indicators */}
          <text x="80" y="150" textAnchor="middle" className="text-xs fill-gray-600 font-semibold">Leg Side</text>
          <text x="220" y="150" textAnchor="middle" className="text-xs fill-gray-600 font-semibold">Off Side</text>
          
          {/* Fielders */}
          {fielders.map(fielder => (
            <g key={fielder.id}>
              <circle
                cx={fielder.x}
                cy={fielder.y}
                r="10"
                fill={getFielderColor(fielder)}
                stroke="#fff"
                strokeWidth="2"
                className="cursor-move hover:opacity-80 transition-opacity"
                onMouseDown={(e) => handleFielderDrag(e, fielder.id)}
                onClick={() => openPlayerModal(fielder.id, false)}
              />
              <text
                x={fielder.x}
                y={fielder.y - 15}
                textAnchor="middle"
                className="text-xs fill-gray-700 pointer-events-none font-semibold"
              >
                {getFielderDisplayName(fielder)}
              </text>
            </g>
          ))}
          
          {/* Ball trajectory */}
          {ballTrajectory && (
            <g>
              <line
                x1="150"
                y1="130"
                x2={ballTrajectory.x}
                y2={ballTrajectory.y}
                stroke="#f59e0b"
                strokeWidth="4"
                strokeDasharray="8,4"
              />
              <circle
                cx={ballTrajectory.x}
                cy={ballTrajectory.y}
                r="6"
                fill="#dc2626"
                stroke="#fff"
                strokeWidth="2"
              />
            </g>
          )}
          
          {/* Fielder movement */}
          {fielderMovement && (
            <circle
              cx={fielderMovement.x}
              cy={fielderMovement.y}
              r="8"
              fill="none"
              stroke="#dc2626"
              strokeWidth="3"
              strokeDasharray="6,3"
            />
          )}
        </svg>
      </div>
      
      {/* Player Assignment Modal */}
      {showPlayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Assign Player to {selectedFielder?.isBowler ? 'Bowler' : 'Fielder'}
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availablePlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => selectedFielder?.isBowler 
                    ? handleAssignBowler(player)
                    : handleAssignPlayer(selectedFielder.id, player)
                  }
                  className="w-full text-left p-3 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <div className="font-medium">
                    {player.display_name || `${player.fname} ${player.lname}`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {player.role} • #{player.jersey_number}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowPlayerModal(false);
                  setSelectedFielder(null);
                }}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <p className="flex items-center mb-1">
          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Click on field to set ball direction
        </p>
        <p className="flex items-center mb-1">
          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
          Drag fielders to reposition them
        </p>
        <p className="flex items-center mb-1">
          <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Click on fielders/bowler to assign players
        </p>
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Select batsman, bowler, power play and field preset to adjust field settings
        </p>
      </div>

      {/* Color Legend */}
      <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <h4 className="font-semibold mb-2">Color Legend:</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>Wicket Keeper</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-black rounded-full mr-2"></div>
            <span>Bowler</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded-full mr-2"></div>
            <span>Fielders</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldSetGround;