// Example usage: Send match toss context to MCP server
// Usage in your React component:
// import { sendMCPContext } from './services/api';
// sendMCPContext('match_toss', {
//   match_id: 1,
//   toss_winner: 2,
//   toss_decision: 'bat',
//   batting_team: 2,
//   bowling_team: 3
// });
// // src/services/api.js
// import axios from 'axios';

// const BASE_URL = 'http://127.0.0.1:8000/api';

// const cricketAPI = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Teams API
// export const getTeams = () => cricketAPI.get('/teams/');
// export const createTeam = (teamData) => cricketAPI.post('/teams/', teamData);
// export const updateTeam = (teamId, teamData) => cricketAPI.put(`/teams/${teamId}/`, teamData);
// export const deleteTeam = (teamId) => cricketAPI.delete(`/teams/${teamId}/`);

// // Players API
// export const getPlayers = () => cricketAPI.get('/players/');
// export const getPlayersByTeam = (teamId) => cricketAPI.get(`/players/?team_id=${teamId}`);
// export const createPlayer = (playerData) => cricketAPI.post('/players/', playerData);
// export const updatePlayer = (playerId, playerData) => cricketAPI.put(`/players/${playerId}/`, playerData);
// export const deletePlayer = (playerId) => cricketAPI.delete(`/players/${playerId}/`);

// // Matches API
// export const getMatches = () => cricketAPI.get('/matches/');
// export const getMatch = (matchId) => cricketAPI.get(`/matches/${matchId}/`);
// export const createMatch = (matchData) => cricketAPI.post('/matches/', matchData);
// export const setToss = (matchId, tossData) => cricketAPI.post(`/matches/${matchId}/set_toss/`, tossData);
// export const addBall = (matchId, ballData) => cricketAPI.post(`/matches/${matchId}/add_ball/`, ballData);
// export const completeMatch = (matchId, resultData) => cricketAPI.post(`/matches/${matchId}/complete_match/`, resultData);
// export const getScorecard = (matchId) => cricketAPI.get(`/matches/${matchId}/scorecard/`);

// // Overs API
// export const getOvers = (matchId) => cricketAPI.get(`/overs/?match_id=${matchId}`);
// export const getBalls = (overId) => cricketAPI.get(`/balls/?over_id=${overId}`);

// export const getLatestMatch = () => cricketAPI.get('/matches/?ordering=-id');

// export { cricketAPI };



// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const cricketAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Teams
export const getTeams = () => cricketAPI.get('/teams/');
export const createTeam = (teamData) => cricketAPI.post('/teams/', teamData);
export const getTeamStatistics = (teamId) => cricketAPI.get(`/teams/${teamId}/statistics/`);

// Players
export const getPlayers = (params = {}) => cricketAPI.get('/players/', { params });
export const createPlayer = (playerData) => cricketAPI.post('/players/', playerData);
export const getPlayerStats = (playerId) => cricketAPI.get(`/players/${playerId}/career_stats/`);

// Matches
export const getMatches = () => cricketAPI.get('/matches/');
export const createMatch = (matchData) => cricketAPI.post('/matches/', matchData);
export const setToss = (matchId, tossData) => cricketAPI.post(`/matches/${matchId}/set_toss/`, tossData);
export const updatePlayers = (matchId, playersData) => cricketAPI.post(`/matches/${matchId}/update_players/`, playersData);
export const addBall = (matchId, ballData) => cricketAPI.post(`/matches/${matchId}/add_ball/`, ballData);
export const completeMatch = (matchId, resultData) => cricketAPI.post(`/matches/${matchId}/complete_match/`, resultData);
export const getScorecard = (matchId) => cricketAPI.get(`/matches/${matchId}/scorecard/`);
export const getLiveScore = (matchId) => cricketAPI.get(`/matches/${matchId}/live_score/`);
export const getMatchStatistics = (matchId) => cricketAPI.get(`/matches/${matchId}/statistics/`);
export const getManhattanChart = (matchId, inningNumber = 1) => cricketAPI.get(`/matches/${matchId}/manhattan/?inning_number=${inningNumber}`);
export const getWormChart = (matchId) => cricketAPI.get(`/matches/${matchId}/worm_chart/`);

// Innings, Records, etc.
export const getInnings = (matchId) => cricketAPI.get('/innings/', { params: { match_id: matchId } });
export const getBattingRecords = (inningId) => cricketAPI.get('/batting-records/', { params: { inning_id: inningId } });
export const getBowlingRecords = (inningId) => cricketAPI.get('/bowling-records/', { params: { inning_id: inningId } });

export { cricketAPI };