// src/components/PlayerManagementContent.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trophy, UserPlus, Edit, Trash2, Save, X } from 'lucide-react';
import { getPlayersByTeam, createPlayer, updatePlayer, deletePlayer } from '../services/api';

const PlayerManagementContent = ({ teams, setTeams, showToast }) => {
  const [newPlayer, setNewPlayer] = useState({
    fname: '',
    lname: '',
    display_name: '',
    role: 'batsman',
    bowler_type: '',
    batsman_type: '',
    left_handed: false,
    age: null,
    jersey_number: '',
    team: teams.team1?.id || ''
  });

  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch players when teams change
  useEffect(() => {
    const fetchPlayersForTeams = async () => {
      const updatedTeams = { ...teams };
      
      for (const [teamKey, team] of Object.entries(teams)) {
        if (team.id) {
          try {
            const response = await getPlayersByTeam(team.id);
            updatedTeams[teamKey].players = response.data.results || response.data || [];
          } catch (error) {
            console.error(`Error fetching players for ${team.name}:`, error);
            updatedTeams[teamKey].players = [];
          }
        }
      }
      
      setTeams(updatedTeams);
    };

    if (teams.team1?.id || teams.team2?.id) {
      fetchPlayersForTeams();
    }
  }, [teams.team1?.id, teams.team2?.id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPlayer(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingPlayer(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addPlayer = async () => {
    if (!newPlayer.fname || !newPlayer.lname) {
      showToast('Please enter first name and last name', 'error');
      return;
    }

    if (!newPlayer.team) {
      showToast('Please select a team', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare player data - only send fields that have values
      const playerData = {
        team: newPlayer.team,
        fname: newPlayer.fname.trim(),
        lname: newPlayer.lname.trim(),
        role: newPlayer.role,
        left_handed: newPlayer.left_handed,
        age: newPlayer.age || 18,
        ...(newPlayer.display_name && { display_name: newPlayer.display_name.trim() }),
        ...(newPlayer.batsman_type && { batsman_type: newPlayer.batsman_type }),
        ...(newPlayer.bowler_type && { bowler_type: newPlayer.bowler_type }),
        ...(newPlayer.jersey_number && { jersey_number: parseInt(newPlayer.jersey_number) })
      };

      const response = await createPlayer(playerData);
      
      // Update local state
      const updatedTeams = { ...teams };
      const teamKey = Object.keys(teams).find(key => teams[key].id === parseInt(newPlayer.team));
      
      if (teamKey) {
        updatedTeams[teamKey].players = [
          ...(updatedTeams[teamKey].players || []),
          response.data
        ];
        setTeams(updatedTeams);
      }

      // Reset form
      setNewPlayer({
        fname: '',
        lname: '',
        display_name: '',
        role: 'batsman',
        bowler_type: '',
        batsman_type: '',
        left_handed: false,
        age: 18,
        jersey_number: '',
        team: teams.team1?.id || ''
      });

      showToast(`${response.data.display_name || response.data.fname} added successfully!`, 'success');
    } catch (error) {
      console.error('Error adding player:', error);
      showToast('Error adding player. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditPlayer = (player) => {
    setEditingPlayer({ ...player });
  };

  const cancelEdit = () => {
    setEditingPlayer(null);
  };

  const updatePlayerData = async () => {
    if (!editingPlayer.fname || !editingPlayer.lname) {
      showToast('Please enter first name and last name', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare update data - only send fields that have values
      const updateData = {
        fname: editingPlayer.fname.trim(),
        lname: editingPlayer.lname.trim(),
        role: editingPlayer.role,
        left_handed: editingPlayer.left_handed,
        age: editingPlayer.age || 18,
        ...(editingPlayer.display_name && { display_name: editingPlayer.display_name.trim() }),
        ...(editingPlayer.batsman_type && { batsman_type: editingPlayer.batsman_type }),
        ...(editingPlayer.bowler_type && { bowler_type: editingPlayer.bowler_type }),
        ...(editingPlayer.jersey_number ? { jersey_number: parseInt(editingPlayer.jersey_number) } : { jersey_number: null })
      };

      const response = await updatePlayer(editingPlayer.id, updateData);
      
      // Update local state
      const updatedTeams = { ...teams };
      Object.keys(updatedTeams).forEach(teamKey => {
        if (updatedTeams[teamKey].players) {
          updatedTeams[teamKey].players = updatedTeams[teamKey].players.map(player =>
            player.id === editingPlayer.id ? response.data : player
          );
        }
      });
      
      setTeams(updatedTeams);
      setEditingPlayer(null);
      showToast('Player updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating player:', error);
      showToast('Error updating player. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const removePlayer = async (playerId, playerName) => {
    if (!window.confirm(`Are you sure you want to delete ${playerName}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deletePlayer(playerId);
      
      // Update local state
      const updatedTeams = { ...teams };
      Object.keys(updatedTeams).forEach(teamKey => {
        if (updatedTeams[teamKey].players) {
          updatedTeams[teamKey].players = updatedTeams[teamKey].players.filter(
            player => player.id !== playerId
          );
        }
      });
      
      setTeams(updatedTeams);
      showToast('Player deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting player:', error);
      showToast('Error deleting player. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Player Form */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
        <h3 className="font-bold mb-4 flex items-center text-lg">
          <UserPlus className="w-6 h-6 mr-2 text-green-600" />
          Add New Player
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="fname"
              placeholder="First Name *"
              value={newPlayer.fname}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="text"
              name="lname"
              placeholder="Last Name *"
              value={newPlayer.lname}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="text"
              name="display_name"
              placeholder="Display Name (optional)"
              value={newPlayer.display_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="number"
              name="age"
              placeholder="Age (optional)"
              value={newPlayer.age}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="16"
              max="50"
            />
          </div>
          <div>
            <select
              name="team"
              value={newPlayer.team}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Team *</option>
              {Object.values(teams).map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="role"
              value={newPlayer.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="batsman">Batsman</option>
              <option value="bowler">Bowler</option>
              <option value="allrounder">All-rounder</option>
              <option value="wicketkeeper">Wicket Keeper</option>
            </select>
          </div>
        </div>
        
        {(newPlayer.role === 'bowler' || newPlayer.role === 'allrounder') && (
          <div className="mt-4">
            <select
              name="bowler_type"
              value={newPlayer.bowler_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Bowling Type (optional)</option>
              <option value="fast">Fast Bowler</option>
              <option value="medium">Medium Pace</option>
              <option value="spin">Spin Bowler</option>
              <option value="leg-spin">Leg Spin</option>
              <option value="off-spin">Off Spin</option>
            </select>
          </div>
        )}

        <div className="mt-4">
          <select
            name="batsman_type"
            value={newPlayer.batsman_type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Batsman Type (optional)</option>
            <option value="opener">Opener</option>
            <option value="middle_order">Middle Order</option>
            <option value="finisher">Finisher</option>
            <option value="allrounder">All-rounder</option>
          </select>
        </div>
        
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="leftHanded"
            name="left_handed"
            checked={newPlayer.left_handed}
            onChange={handleInputChange}
            className="mr-2 w-4 h-4 text-blue-600"
          />
          <label htmlFor="leftHanded" className="text-sm font-medium">Left-handed batsman</label>
        </div>
        
        <input
          type="number"
          name="jersey_number"
          placeholder="Jersey Number (optional)"
          value={newPlayer.jersey_number}
          onChange={handleInputChange}
          className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <button
          onClick={addPlayer}
          disabled={isLoading || !newPlayer.fname || !newPlayer.lname || !newPlayer.team}
          className={`w-full mt-4 py-3 rounded-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2 ${
            isLoading || !newPlayer.fname || !newPlayer.lname || !newPlayer.team
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          <span>{isLoading ? 'Adding Player...' : 'Add Player'}</span>
        </button>
      </div>

      {/* Teams Display with CRUD */}
      <div className="grid grid-cols-2 gap-6">
        {Object.entries(teams).map(([teamKey, team]) => (
          <div key={teamKey} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <h4 className="font-bold text-lg mb-3 text-gray-800 flex items-center justify-between">
              <span className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                {team.name}
              </span>
              <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {team.players?.length || 0} players
              </span>
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {team.players?.map(player => (
                <div key={player.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  {editingPlayer?.id === player.id ? (
                    // Edit Form
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          name="fname"
                          value={editingPlayer.fname}
                          onChange={handleEditInputChange}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          name="lname"
                          value={editingPlayer.lname}
                          onChange={handleEditInputChange}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Last Name"
                        />
                      </div>
                      <input
                        type="text"
                        name="display_name"
                        value={editingPlayer.display_name || ''}
                        onChange={handleEditInputChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Display Name"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          name="role"
                          value={editingPlayer.role}
                          onChange={handleEditInputChange}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="batsman">Batsman</option>
                          <option value="bowler">Bowler</option>
                          <option value="allrounder">All-rounder</option>
                          <option value="wicketkeeper">Wicket Keeper</option>
                        </select>
                        <input
                          type="number"
                          name="age"
                          value={editingPlayer.age}
                          onChange={handleEditInputChange}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Age"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={updatePlayerData}
                          disabled={isLoading}
                          className="flex-1 bg-green-500 text-white py-1 px-2 rounded text-sm flex items-center justify-center space-x-1"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 bg-gray-500 text-white py-1 px-2 rounded text-sm flex items-center justify-center space-x-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <>
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-800 flex items-center">
                          <span>{player.display_name || `${player.fname} ${player.lname}`}</span>
                          {player.left_handed && (
                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">LH</span>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => startEditPlayer(player)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Edit Player"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removePlayer(player.id, player.display_name || `${player.fname} ${player.lname}`)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete Player"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        <div className="flex justify-between">
                          <span className="capitalize">{player.role}</span>
                          <span>Age {player.age}</span>
                        </div>
                        {player.bowler_type && (
                          <div className="text-green-600 mt-1 capitalize">{player.bowler_type} bowler</div>
                        )}
                        {player.batsman_type && (
                          <div className="text-purple-600 mt-1 capitalize">{player.batsman_type.replace('_', ' ')}</div>
                        )}
                        {player.jersey_number && (
                          <div className="text-blue-600 mt-1">#{player.jersey_number}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {(!team.players || team.players.length === 0) && (
                <div className="text-center text-gray-500 py-4">
                  No players added yet
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerManagementContent;