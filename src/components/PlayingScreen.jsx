// src/components/PlayingScreen.jsx
import React, { useState, useEffect } from 'react';
import { Trophy, Users } from 'lucide-react';
import BallInputPanel from './BallInputPanel';
import ScoreHeader from './ScoreHeader';
import FieldSetGround from '../pages/components/FieldSetGround ';
import { addBall, getInningsByMatch, createMatch, createBowlingRecord } from '../services/api';


const PlayingScreen = ({
  matchConfig,
  teams,
  onFinishMatch,
  onOpenPlayerManagement
}) => {
  // State declarations
  const [currentOver, setCurrentOver] = useState(1);
  const [currentBall, setCurrentBall] = useState(1);
  const [striker, setStriker] = useState('');
  const [nonStriker, setNonStriker] = useState('');
  const [bowler, setBowler] = useState('');
  const [totalRuns, setTotalRuns] = useState(0);
  const [wickets, setWickets] = useState(0);

  // Fetch current inning data from backend
  const fetchCurrentInning = async () => {
    if (!matchConfig.id) return;
    try {
      const response = await getInningsByMatch(matchConfig.id);
      const innings = response.data.results || response.data || [];
      if (innings.length > 0) {
        // Find current inning based on match status
        let currentInningData;
        if (matchConfig.status === 'inning1') {
          currentInningData = innings.find(inning => inning.inning_number === 1);
        } else if (matchConfig.status === 'inning2') {
          currentInningData = innings.find(inning => inning.inning_number === 2);
        } else {
          currentInningData = innings[0]; // fallback
        }
        if (currentInningData) {
          setCurrentInning(currentInningData);
          setTotalRuns(currentInningData.total_runs || 0);
          setWickets(currentInningData.wickets || 0);
          setCurrentOver(currentInningData.current_over || 1);
          setCurrentBall(currentInningData.current_ball || 1);
          updateAvailablePlayers(currentInningData);
          // Ball event log: get last 10 balls from all overs
          let balls = [];
          if (currentInningData.overs) {
            currentInningData.overs.forEach(over => {
              if (over.balls) balls = balls.concat(over.balls);
            });
          }
          balls = balls.slice(-10).reverse(); // last 10 balls, most recent first
          setBallLog(balls);
          // Set players from inning data
          if (currentInningData.striker_name) {
            setStriker(currentInningData.striker_name);
          } else if (currentInningData.striker) {
            const strikerPlayer = findPlayerById(currentInningData.striker);
            if (strikerPlayer) setStriker(strikerPlayer.display_name || `${strikerPlayer.fname} ${strikerPlayer.lname}`);
          }
          if (currentInningData.non_striker_name) {
            setNonStriker(currentInningData.non_striker_name);
          } else if (currentInningData.non_striker) {
            const nonStrikerPlayer = findPlayerById(currentInningData.non_striker);
            if (nonStrikerPlayer) setNonStriker(nonStrikerPlayer.display_name || `${nonStrikerPlayer.fname} ${nonStrikerPlayer.lname}`);
          }
          if (currentInningData.bowler_name) {
            setBowler(currentInningData.bowler_name);
          } else if (currentInningData.current_bowler) {
            const bowlerPlayer = findPlayerById(currentInningData.current_bowler);
            if (bowlerPlayer) setBowler(bowlerPlayer.display_name || `${bowlerPlayer.fname} ${bowlerPlayer.lname}`);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching innings data:', error);
    }
  };
  // (state declarations already present above)
  const [isSaved, setIsSaved] = useState(false);
  const [unsavedRuns, setUnsavedRuns] = useState('');
  const [unsavedEvent, setUnsavedEvent] = useState('');
  const [currentInning, setCurrentInning] = useState(null);
  const [unsavedBallData, setUnsavedBallData] = useState(null);
  const [availableBatsmen, setAvailableBatsmen] = useState([]);
  const [availableBowlers, setAvailableBowlers] = useState([]);
  const [ballLog, setBallLog] = useState([]); // Ball event log
  const [savingBall, setSavingBall] = useState(false);
  const [overCompleted, setOverCompleted] = useState(false);

  // Update available players from innings data
  const updateAvailablePlayers = (inningData) => {
    if (inningData.batting_records) {
      const batsmen = inningData.batting_records.map(record => ({
        id: record.player,
        name: record.player_name,
        runs: record.runs,
        balls_faced: record.balls_faced,
        is_out: record.is_out
      })).filter(player => !player.is_out);
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
  };

  useEffect(() => {
    fetchCurrentInning();
  }, [matchConfig.id, matchConfig.status]);

  // Always display backend's current_over/current_ball
  // (already handled in fetchCurrentInning, but ensure UI uses these states)

  // Helper function to find player ID by name
  const findPlayerIdByName = (playerName) => {
    if (!playerName) return null;
    for (const teamKey in teams) {
      const team = teams[teamKey];
      const player = team.players?.find(p => 
        p.display_name === playerName || `${p.fname} ${p.lname}` === playerName
      );
      if (player) return player.id;
    }
    return null;
  };

  // Helper function to find player by ID
  const findPlayerById = (playerId) => {
    if (!playerId) return null;
    for (const teamKey in teams) {
      const team = teams[teamKey];
      const player = team.players?.find(p => p.id === playerId);
      if (player) return player;
    }
    return null;
  };

  // Ensure batting record exists for a player
  const ensureBattingRecordExists = async (playerName, inningId) => {
    const playerId = findPlayerIdByName(playerName);
    if (!playerId) {
      console.error(`Player not found: ${playerName}`);
      return false;
    }

    const existingRecord = availableBatsmen.find(batsman => 
      batsman.id === playerId && !batsman.is_out
    );

    if (!existingRecord) {
      try {
        const battingRecordData = {
          inning: inningId,
          player: playerId,
          runs: 0,
          balls_faced: 0,
          fours: 0,
          sixes: 0,
          strike_rate: 0.0,
          is_out: false,
          dismissal_type: '',
          fielder: null,
          bowler: null
        };

        await createMatch(battingRecordData);
        console.log(`Created batting record for ${playerName}`);
        await fetchCurrentInning();
        return true;
      } catch (error) {
        console.error(`Error creating batting record for ${playerName}:`, error);
        return false;
      }
    }

    return true;
  };

  // Ensure bowling record exists for a player
  const ensureBowlingRecordExists = async (playerName, inningId) => {
    const playerId = findPlayerIdByName(playerName);
    if (!playerId) {
      console.error(`Player not found: ${playerName}`);
      return false;
    }

    const existingRecord = availableBowlers.find(bowler => bowler.id === playerId);

    if (!existingRecord) {
      try {
        const bowlingRecordData = {
          inning: inningId,
          player: playerId,
          overs_bowled: 0.0,
          maidens: 0,
          runs_conceded: 0,
          wickets: 0,
          wides: 0,
          no_balls: 0,
          economy_rate: 0.0
        };

        await createBowlingRecord(bowlingRecordData);
        console.log(`Created bowling record for ${playerName}`);
        await fetchCurrentInning();
        return true;
      } catch (error) {
        console.error(`Error creating bowling record for ${playerName}:`, error);
        return false;
      }
    }

    return true;
  };

  const handleRunInput = (runs, eventType, ballData = null) => {
    setUnsavedRuns(runs);
    setUnsavedEvent(eventType);
    setIsSaved(false);
    
    if (ballData) {
      setUnsavedBallData(ballData);
    } else {
      const basicBallData = {
        ball_number: currentBall,
        event: eventType,
        runs: parseInt(runs || 0),
        is_wicket: false,
        batsman: findPlayerIdByName(striker),
        bowler: findPlayerIdByName(bowler),
        is_extra: false,
        extra_type: '',
        extra_runs: 0
      };
      setUnsavedBallData(basicBallData);
    }
  };

  const handleEventInput = (ballData) => {
    setUnsavedEvent(ballData.event);
    setUnsavedRuns(ballData.runs || 0);
    
    // Convert player names to IDs for backend
    const processedBallData = {
      ...ballData,
      batsman: findPlayerIdByName(striker),
      bowler: findPlayerIdByName(bowler),
    };

    // Convert dismissed_batsman from name to ID if it exists
    if (ballData.dismissed_batsman) {
      processedBallData.dismissed_batsman = findPlayerIdByName(ballData.dismissed_batsman);
    }

    // Convert fielder from name to ID if it exists
    if (ballData.fielder) {
      processedBallData.fielder = findPlayerIdByName(ballData.fielder);
    }

    setUnsavedBallData(processedBallData);
    setIsSaved(false);
  };

  const saveBall = async () => {
    if (!unsavedBallData || savingBall) return;
    setSavingBall(true);
    setOverCompleted(false);
    try {
      if (!currentInning) {
        await fetchCurrentInning();
        if (!currentInning) {
          throw new Error('No current inning found');
        }
      }
      // Ensure batting and bowling records exist
      if (striker) {
        await ensureBattingRecordExists(striker, currentInning.id);
      }
      if (bowler) {
        await ensureBowlingRecordExists(bowler, currentInning.id);
      }
      // Final validation of ball data
      const ballDataToSave = {
        ...unsavedBallData,
        ball_number: currentBall,
        batsman: findPlayerIdByName(striker),
        bowler: findPlayerIdByName(bowler),
      };
      if (!ballDataToSave.batsman) {
        throw new Error('Striker player ID not found');
      }
      if (!ballDataToSave.bowler) {
        throw new Error('Bowler player ID not found');
      }
      console.log("Saving ball data:", {
        matchId: matchConfig.id,
        inningNumber: matchConfig.currentInnings,
        overNumber: currentOver,
        ballData: ballDataToSave
      });
      const response = await addBall(
        matchConfig.id, 
        matchConfig.currentInnings, 
        currentOver, 
        ballDataToSave
      );
      console.log("Ball saved successfully:", response.data);
      setIsSaved(true);
      setUnsavedBallData(null);
      await fetchCurrentInning();
    } catch (error) {
      console.error('Error saving ball:', error);
      console.error('Error details:', error.response?.data);
      if (error.response?.data?.error === "Over is already completed") {
        setOverCompleted(true);
        await fetchCurrentInning();
      }
    }
    setSavingBall(false);
  };

  const nextBall = () => {
    setUnsavedRuns('');
    setUnsavedEvent('');
    setUnsavedBallData(null);
    setIsSaved(false);
    setOverCompleted(false);
    // Don't manually update over/ball - let backend handle this
  };

  const handlePlayersUpdate = async ({ striker: newStriker, nonStriker: newNonStriker, bowler: newBowler }) => {
    if (newStriker && newStriker !== striker) {
      setStriker(newStriker);
      if (currentInning) {
        await ensureBattingRecordExists(newStriker, currentInning.id);
      }
    }
    
    if (newNonStriker && newNonStriker !== nonStriker) {
      setNonStriker(newNonStriker);
      if (currentInning) {
        await ensureBattingRecordExists(newNonStriker, currentInning.id);
      }
    }
    
    if (newBowler && newBowler !== bowler) {
      setBowler(newBowler);
      if (currentInning) {
        await ensureBowlingRecordExists(newBowler, currentInning.id);
      }
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4 shadow-lg" >
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {teams.team1.name} <span style={{color:'red'}}> vs  </span> {teams.team2.name} • {new Date().toLocaleDateString()} • {matchConfig.venue} • {matchConfig.matchType}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenPlayerManagement}
              className="flex items-center space-x-2 bg-blue-600 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Players</span>
            </button>
            <button
              onClick={onFinishMatch}
              className="flex items-center space-x-2 bg-red-600 px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span>End Match</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        <ScoreHeader
          matchConfig={matchConfig}
          teams={teams}
          striker={striker}
          setStriker={setStriker}
          nonStriker={nonStriker}
          setNonStriker={setNonStriker}
          bowler={bowler}
          setBowler={setBowler}
          totalRuns={totalRuns}
          wickets={wickets}
          currentOver={currentOver}
          currentBall={currentBall}
          onOverChange={(overNumber, ballNumber) => {
            setCurrentOver(overNumber);
            setCurrentBall(ballNumber);
          }}
        />

        {/* Main Playing Area */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div>
            <BallInputPanel
              unsavedRuns={unsavedRuns}
              unsavedEvent={unsavedEvent}
              isSaved={isSaved}
              onRunInput={handleRunInput}
              onEventInput={handleEventInput}
              onSaveBall={saveBall}
              onNextBall={nextBall}
              teams={teams}
              striker={striker}
              nonStriker={nonStriker}
              bowler={bowler}
              matchConfig={matchConfig}
              onPlayersUpdate={handlePlayersUpdate}
              currentOver={currentOver}
              currentBall={currentBall}
              availableBatsmen={availableBatsmen}
              availableBowlers={availableBowlers}
              disabled={savingBall || overCompleted}
            />
            {savingBall && (
              <div className="text-blue-600 text-sm mt-2">Saving ball, please wait...</div>
            )}
            {overCompleted && (
              <div className="text-red-600 text-sm mt-2">Over is completed. Waiting for backend to update over/ball numbers...</div>
            )}
          </div>
          <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FieldSetGround />
            {/* Ball Event Log */}
            <div className="bg-white rounded-xl shadow p-4 mt-6">
              <div className="font-bold text-lg mb-2">Recent Balls</div>
              <ul className="text-sm space-y-1">
                {ballLog.length === 0 && <li className="text-gray-400">No balls yet.</li>}
                {ballLog.map((ball, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span className="font-mono">Over {ball.over} Ball {ball.ball_number}</span>
                    <span>{ball.batsman_name} vs {ball.bowler_name}</span>
                    <span>{ball.event} {ball.runs}{ball.is_wicket ? ' WICKET' : ''}{ball.is_extra ? ` (${ball.extra_type} ${ball.extra_runs})` : ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayingScreen;