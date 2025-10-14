// src/components/CricketMatchManager.jsx
import React, { useEffect, useState, useRef } from 'react';
import SetupScreen from './SetupScreen';
import PlayingScreen from './PlayingScreen';
import MatchCompleteScreen from './MatchCompleteScreen';
import PlayerManagementContent from './PlayerManagementContent';
import TossDecisionContent from './TossDecisionContent';
import MatchResultContent from './MatchResultContent';
import Toast from './Toast';
import Modal from './Modal';
import { 
  cricketAPI, 
  getTeams, 
  createTeam, 
  getPlayers,
  createPlayer,
  getMatches, 
  createMatch, 
  setToss, 
  updatePlayers,
  addBall,
  getScorecard,
  getLiveScore,
  getMatchStatistics,
  completeMatch,
  getPlayerStats,
  getTeamStatistics
} from '../services/api';

const CricketMatchManager = () => {
  const MATCH_STATE_KEY = 'cricket_match_state';

  // State
  const [gameState, setGameState] = useState('setup');
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [modals, setModals] = useState({
    playerManagement: false,
    tossDecision: false,
    matchResult: false
  });
  const [availableTeams, setAvailableTeams] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [matchData, setMatchData] = useState(null);
  const [liveScore, setLiveScore] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  
  const [matchConfig, setMatchConfig] = useState({
    id: null,
    matchType: 'T20',
    customMatchType: '',
    overs: 20,
    team1: '',
    team2: '',
    venue: 'Fischer County Ground',
    tossWinner: '',
    tossDecision: '',
    currentInnings: 1
  });
  
  const [teams, setTeams] = useState({
    team1: {
      id: null,
      name: '',
      short_name: '',
      players: []
    },
    team2: {
      id: null,
      name: '',
      short_name: '',
      players: []
    }
  });
  
  const matchIdRef = useRef(null);

  // API Data Fetching Functions
  const fetchAllData = async () => {
    console.log('🔄 Starting comprehensive data fetch...');
    
    try {
      // Fetch teams
      console.log('📥 Fetching teams...');
      const teamsResponse = await getTeams();
      console.log('✅ Teams data:', teamsResponse.data);
      setAvailableTeams(teamsResponse.data.results || teamsResponse.data || []);

      // Fetch players
      console.log('📥 Fetching players...');
      const playersResponse = await getPlayers();
      console.log('✅ Players data:', playersResponse.data);
      setAllPlayers(playersResponse.data.results || playersResponse.data || []);

      // Fetch matches
      console.log('📥 Fetching matches...');
      const matchesResponse = await getMatches();
      console.log('✅ Matches data:', matchesResponse.data);

      // If we have an active match ID, fetch detailed data
      if (matchIdRef.current) {
        await fetchMatchDetails(matchIdRef.current);
      }

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      showToast('Error fetching data from server', 'error');
    }
  };

  const fetchMatchDetails = async (matchId) => {
    console.log(`📥 Fetching details for match ${matchId}...`);
    
    try {
      // Fetch live score
      const liveResponse = await getLiveScore(matchId);
      console.log('🎯 Live score:', liveResponse.data);
      setLiveScore(liveResponse.data);

      // Fetch scorecard
      const scorecardResponse = await getScorecard(matchId);
      console.log('📊 Scorecard:', scorecardResponse.data);
      setScorecard(scorecardResponse.data);

      // Fetch match statistics
      const statsResponse = await getMatchStatistics(matchId);
      console.log('📈 Match statistics:', statsResponse.data);

      // Fetch match details
      const matchResponse = await getMatches();
      const currentMatch = (matchResponse.data.results || matchResponse.data).find(m => m.id === matchId);
      console.log('🏏 Match details:', currentMatch);
      setMatchData(currentMatch);

    } catch (error) {
      console.error('❌ Error fetching match details:', error);
    }
  };

  const fetchTeamStatistics = async (teamId) => {
    console.log(`📥 Fetching statistics for team ${teamId}...`);
    try {
      const response = await getTeamStatistics(teamId);
      console.log(`📊 Team ${teamId} statistics:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching team ${teamId} stats:`, error);
    }
  };

  const fetchPlayerCareerStats = async (playerId) => {
    console.log(`📥 Fetching career stats for player ${playerId}...`);
    try {
      const response = await getPlayerStats(playerId);
      console.log(`👤 Player ${playerId} career stats:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching player ${playerId} stats:`, error);
    }
  };

  // Enhanced team creation with immediate data refresh
  const handleCreateTeam = async (teamData) => {
    try {
      console.log('🔄 Creating team:', teamData);
      const response = await createTeam(teamData);
      console.log('✅ Team created:', response.data);
      
      showToast(`Team "${teamData.name}" created successfully!`, 'success');
      await fetchAllData(); // Refresh all data
      return response.data;
    } catch (error) {
      console.error('❌ Error creating team:', error);
      showToast('Error creating team. Please try again.', 'error');
      throw error;
    }
  };

  // Enhanced player creation
  const handleCreatePlayer = async (playerData) => {
    try {
      console.log('🔄 Creating player:', playerData);
      const response = await createPlayer(playerData);
      console.log('✅ Player created:', response.data);
      
      showToast(`Player "${playerData.fname} ${playerData.lname}" created!`, 'success');
      await fetchAllData(); // Refresh all data
      return response.data;
    } catch (error) {
      console.error('❌ Error creating player:', error);
      showToast('Error creating player. Please try again.', 'error');
      throw error;
    }
  };

  // Enhanced match creation
  const startMatch = async () => {
    // Validation
    if (!matchConfig.team1 || !matchConfig.team2) {
      showToast('Please select both teams', 'error');
      return;
    }
    if (matchConfig.team1 === matchConfig.team2) {
      showToast('Please select different teams', 'error');
      return;
    }
    if (teams.team1.players.length < 11 || teams.team2.players.length < 11) {
      showToast('Each team needs at least 11 players', 'error');
      return;
    }

    try {
      const matchData = {
        match_type: matchConfig.matchType === 'custom' ? matchConfig.customMatchType : matchConfig.matchType,
        overs_per_innings: matchConfig.overs,
        team1: teams.team1.id,
        team2: teams.team2.id,
        venue: matchConfig.venue,
        status: 'scheduled'
      };
      
      console.log('🔄 Creating match with data:', matchData);
      const createResponse = await createMatch(matchData);
      console.log('✅ Match creation response:', createResponse.data);

      let matchId;
      if (createResponse.data && createResponse.data.id) {
        matchId = createResponse.data.id;
      } else {
        const matchesResponse = await getMatches();
        const allMatches = matchesResponse.data.results || matchesResponse.data || [];
        const ourMatch = allMatches
          .filter(match => 
            match.team1 === teams.team1.id && 
            match.team2 === teams.team2.id
          )
          .sort((a, b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id))[0];
        
        if (!ourMatch) throw new Error('Match created but not found');
        matchId = ourMatch.id;
      }
      
      matchIdRef.current = matchId;
      setMatchConfig(prev => ({ ...prev, id: matchId, status: 'scheduled' }));
      
      console.log('✅ Match ID stored:', matchId);
      
      // Fetch initial match details
      await fetchMatchDetails(matchId);
      
      setGameState('toss');
      openModal('tossDecision');
      showToast('Match created successfully!', 'success');
      
    } catch (error) {
      console.error('❌ Error in startMatch:', error);
      showToast('Error creating match: ' + error.message, 'error');
    }
  };

  // Enhanced toss handling
  const handleTossDecision = async (winner, decision) => {
    const matchId = matchIdRef.current;
    
    console.log('🎲 TOSS DEBUG:', {
      matchId,
      winner,
      decision,
      winnerTeamId: winner === 'team1' ? teams.team1.id : teams.team2.id
    });

    if (!matchId) {
      showToast('Match ID not found. Please create the match again.', 'error');
      return;
    }

    try {
      const winnerTeam = winner === 'team1' ? teams.team1 : teams.team2;
      const tossData = {
        toss_winner: winnerTeam.id,
        toss_decision: decision
      };
      
      console.log('📤 Setting toss:', tossData);
      const response = await setToss(matchId, tossData);
      console.log('✅ Toss set successfully:', response.data);

      // Update local state
      setMatchConfig(prev => ({ 
        ...prev, 
        tossWinner: winner,
        tossDecision: decision,
        status: 'inning1'
      }));

      // Refresh match details
      await fetchMatchDetails(matchId);
      
      closeModal('tossDecision');
      setGameState('playing');
      showToast(`${winnerTeam.name} won the toss and chose to ${decision}`, 'success');
      
    } catch (error) {
      console.error('❌ Error setting toss:', error);
      let errorMessage = 'Error setting toss decision';
      if (error.response?.data?.detail) errorMessage = error.response.data.detail;
      else if (error.response?.data) errorMessage = JSON.stringify(error.response.data);
      showToast(errorMessage, 'error');
    }
  };

  // Ball-by-ball updates
  const handleAddBall = async (ballData) => {
    const matchId = matchIdRef.current;
    if (!matchId) return;

    try {
      console.log('🎯 Adding ball:', ballData);
      const response = await addBall(matchId, ballData);
      console.log('✅ Ball added:', response.data);

      // Refresh live data
      await fetchMatchDetails(matchId);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error adding ball:', error);
      throw error;
    }
  };

  // Update players on field
  const handleUpdatePlayers = async (playersData) => {
    const matchId = matchIdRef.current;
    if (!matchId) return;

    try {
      console.log('🔄 Updating players:', playersData);
      const response = await updatePlayers(matchId, playersData);
      console.log('✅ Players updated:', response.data);
      
      await fetchMatchDetails(matchId);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating players:', error);
      throw error;
    }
  };

  // Complete match
  const finishMatch = async (resultData = null) => {
    const matchId = matchIdRef.current;
    
    if (!matchId) {
      showToast('Match ID not found', 'error');
      return;
    }

    try {
      const completeData = resultData || {
        result: 'team1_win',
        winning_team: teams.team1.id,
        win_margin: 'by 5 wickets'
      };
      
      console.log('🏁 Completing match:', completeData);
      const response = await completeMatch(matchId, completeData);
      console.log('✅ Match completed:', response.data);

      setGameState('finished');
      localStorage.removeItem(MATCH_STATE_KEY);
      openModal('matchResult');
      showToast('Match completed successfully!', 'success');
      
    } catch (error) {
      console.error('❌ Error completing match:', error);
      showToast('Error completing match', 'error');
    }
  };

  const resetMatch = () => {
    matchIdRef.current = null;
    localStorage.removeItem(MATCH_STATE_KEY);
    setGameState('setup');
    setMatchConfig({
      id: null,
      matchType: 'T20',
      customMatchType: '',
      overs: 20,
      team1: '',
      team2: '',
      venue: 'Fischer County Ground',
      tossWinner: '',
      tossDecision: '',
      currentInnings: 1
    });
    setMatchData(null);
    setLiveScore(null);
    setScorecard(null);
  };

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

  // Update teams when selection changes
  useEffect(() => {
    if (matchConfig.team1) {
      const selectedTeam = availableTeams.find(team => team.id === parseInt(matchConfig.team1));
      if (selectedTeam) {
        setTeams(prev => ({
          ...prev,
          team1: {
            id: selectedTeam.id,
            name: selectedTeam.name,
            short_name: selectedTeam.short_name,
            players: selectedTeam.players || []
          }
        }));
      }
    }
  }, [matchConfig.team1, availableTeams]);

  useEffect(() => {
    if (matchConfig.team2) {
      const selectedTeam = availableTeams.find(team => team.id === parseInt(matchConfig.team2));
      if (selectedTeam) {
        setTeams(prev => ({
          ...prev,
          team2: {
            id: selectedTeam.id,
            name: selectedTeam.name,
            short_name: selectedTeam.short_name,
            players: selectedTeam.players || []
          }
        }));
      }
    }
  }, [matchConfig.team2, availableTeams]);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <>
      {gameState === 'setup' && (
        <SetupScreen
          matchConfig={matchConfig}
          setMatchConfig={setMatchConfig}
          teams={teams}
          setTeams={setTeams}
          availableTeams={availableTeams}
          allPlayers={allPlayers}
          onCreateTeam={handleCreateTeam}
          onCreatePlayer={handleCreatePlayer}
          onStartMatch={startMatch}
          onOpenPlayerManagement={() => openModal('playerManagement')}
          onFetchTeamStats={fetchTeamStatistics}
        />
      )}

      {gameState === 'playing' && (
        <PlayingScreen
          matchConfig={matchConfig}
          teams={teams}
          matchData={matchData}
          liveScore={liveScore}
          scorecard={scorecard}
          onAddBall={handleAddBall}
          onUpdatePlayers={handleUpdatePlayers}
          onFinishMatch={finishMatch}
          onOpenPlayerManagement={() => openModal('playerManagement')}
          onFetchMatchDetails={() => fetchMatchDetails(matchIdRef.current)}
          onFetchPlayerStats={fetchPlayerCareerStats}
        />
      )}

      {gameState === 'finished' && (
        <MatchCompleteScreen 
          onResetMatch={resetMatch} 
          matchData={matchData}
          scorecard={scorecard}
        />
      )}

      {/* Modals */}
      <Modal
        isOpen={modals.playerManagement}
        onClose={() => closeModal('playerManagement')}
        title="Player Management"
        size="xl"
      >
        <PlayerManagementContent
          teams={teams}
          setTeams={setTeams}
          allPlayers={allPlayers}
          showToast={showToast}
          onCreatePlayer={handleCreatePlayer}
          onFetchPlayerStats={fetchPlayerCareerStats}
        />
      </Modal>

      <Modal
        isOpen={modals.tossDecision}
        onClose={() => closeModal('tossDecision')}
        title="Toss Decision"
        size="md"
      >
        <TossDecisionContent
          matchConfig={matchConfig}
          teams={teams}
          onTossDecision={handleTossDecision}
        />
      </Modal>

      <Modal
        isOpen={modals.matchResult}
        onClose={() => closeModal('matchResult')}
        title="Match Result"
        size="lg"
      >
        <MatchResultContent
          matchConfig={matchConfig}
          teams={teams}
          matchData={matchData}
          scorecard={scorecard}
          onNewMatch={resetMatch}
        />
      </Modal>

      <Toast {...toast} onClose={hideToast} />
    </>
  );
};

export default CricketMatchManager;