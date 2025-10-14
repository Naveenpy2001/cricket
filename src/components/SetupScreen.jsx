// src/components/SetupScreen.jsx
import React, { useState } from 'react';
import { Trophy, Users, ChevronDown, Plus, X } from 'lucide-react';

const SetupScreen = ({ 
  matchConfig, 
  setMatchConfig, 
  teams, 
  availableTeams = [],
  onStartMatch, 
  onOpenPlayerManagement,
  onCreateTeam
}) => {
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    short_name: '',
    created_at: new Date().toISOString()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTeamChange = (teamField, teamId) => {
    setMatchConfig(prev => ({ ...prev, [teamField]: teamId }));
  };

  const handleMatchTypeChange = (type) => {
    const oversMap = { 
      'T20': 20, 
      'ODI': 50, 
      'Test': 90, 
      'T10': 10,
      'custom': matchConfig.overs || 20
    };
    
    setMatchConfig(prev => ({ 
      ...prev, 
      matchType: type,
      overs: oversMap[type] || 20,
      customMatchType: type === 'custom' ? prev.customMatchType : ''
    }));
  };

  const getSelectedTeam = (teamId) => {
    return availableTeams.find(team => team.id === parseInt(teamId));
  };

  // In SetupScreen.jsx - replace the existing handleAddTeam function
const handleAddTeam = async () => {
  if (!newTeam.name.trim()) {
    alert('Please enter team name');
    return;
  }

  setIsSubmitting(true);
  try {
    // Call the parent component's createTeam function
    await onCreateTeam(newTeam);
    
    // Close modal and reset form on success
    setShowAddTeamModal(false);
    setNewTeam({ name: '', short_name: '', created_at: new Date().toISOString() });
    
  } catch (error) {
    // Error is already handled in parent component, just log it
    console.error('Error creating team:', error);
  } finally {
    setIsSubmitting(false);
  }
};

  const team1 = getSelectedTeam(matchConfig.team1);
  const team2 = getSelectedTeam(matchConfig.team2);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Cricket Match Manager</h1>
            <p className="text-gray-600 mt-2">Professional Cricket Scoring & Management System</p>
          </div>

          <div className="space-y-6">
            {/* Team Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Team 1</label>
                  <button
                    onClick={() => setShowAddTeamModal(true)}
                    className="text-xs bg-green-500 text-white px-2 py-1 rounded flex items-center space-x-1 hover:bg-green-600 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Team</span>
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={matchConfig.team1}
                    onChange={(e) => handleTeamChange('team1', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select Team 1</option>
                    {availableTeams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} {team.short_name && `(${team.short_name})`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
                {team1 && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <div className="font-medium">{team1.name}</div>
                    {team1.short_name && (
                      <div className="text-gray-500">Short: {team1.short_name}</div>
                    )}
                    <div className="text-gray-500">
                      Players: {teams.team1?.players?.length || 0}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Team 2</label>
                  <button
                    onClick={() => setShowAddTeamModal(true)}
                    className="text-xs bg-green-500 text-white px-2 py-1 rounded flex items-center space-x-1 hover:bg-green-600 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Team</span>
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={matchConfig.team2}
                    onChange={(e) => handleTeamChange('team2', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select Team 2</option>
                    {availableTeams
                      .filter(team => team.id !== parseInt(matchConfig.team1))
                      .map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} {team.short_name && `(${team.short_name})`}
                        </option>
                      ))
                    }
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
                {team2 && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <div className="font-medium">{team2.name}</div>
                    {team2.short_name && (
                      <div className="text-gray-500">Short: {team2.short_name}</div>
                    )}
                    <div className="text-gray-500">
                      Players: {teams.team2?.players?.length || 0}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Match Type and Overs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Match Type</label>
                <div className="relative">
                  <select
                    value={matchConfig.matchType}
                    onChange={(e) => handleMatchTypeChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 appearance-none"
                  >
                    <option value="T20">T20 (20 overs)</option>
                    <option value="ODI">ODI (50 overs)</option>
                    <option value="Test">Test Match (90 overs)</option>
                    <option value="T10">T10 (10 overs)</option>
                    <option value="custom">Custom</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
                
                {matchConfig.matchType === 'custom' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Enter custom match type"
                      value={matchConfig.customMatchType}
                      onChange={(e) => setMatchConfig(prev => ({ ...prev, customMatchType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overs per Innings
                  {matchConfig.matchType !== 'custom' && (
                    <span className="text-gray-500 text-xs ml-1">
                      (default for {matchConfig.matchType})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={matchConfig.overs}
                  onChange={(e) => setMatchConfig(prev => ({ ...prev, overs: parseInt(e.target.value) || 20 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="1"
                  max={matchConfig.matchType === 'Test' ? 90 : 50}
                  disabled={matchConfig.matchType === 'Test'}
                />
                {matchConfig.matchType === 'Test' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Test matches use 90 overs per day
                  </p>
                )}
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
              <input
                type="text"
                value={matchConfig.venue}
                onChange={(e) => setMatchConfig(prev => ({ ...prev, venue: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Enter match venue"
                x-webkit-speech = 'true'

              />
            </div>

            {/* Match Summary */}
            {(team1 || team2) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Match Summary</h3>
                <div className="text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Teams:</span>
                    <span className="font-medium">
                      {team1?.name || 'TBD'} vs {team2?.name || 'TBD'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Match Type:</span>
                    <span className="font-medium">
                      {matchConfig.matchType === 'custom' ? matchConfig.customMatchType : matchConfig.matchType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overs:</span>
                    <span className="font-medium">{matchConfig.overs} per innings</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Venue:</span>
                    <span className="font-medium">{matchConfig.venue}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={onOpenPlayerManagement}
                disabled={!team1 || !team2}
                className={`flex-1 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  !team1 || !team2 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Manage Players</span>
              </button>
              <button
                onClick={onStartMatch}
                disabled={!team1 || !team2 || teams.team1?.players?.length < 11 || teams.team2?.players?.length < 11}
                className={`flex-1 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  (!team1 || !team2 || teams.team1?.players?.length < 11 || teams.team2?.players?.length < 11)
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                <Trophy className="w-5 h-5" />
                <span>Start Match</span>
              </button>
            </div>

            {/* Validation Messages */}
            {(!team1 || !team2) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-700 text-sm">
                  Please select both teams to continue
                </p>
              </div>
            )}

            {team1 && team2 && (teams.team1?.players?.length < 11 || teams.team2?.players?.length < 11) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-orange-700 text-sm">
                  Each team needs at least 11 players. Current: 
                  Team 1 - {teams.team1?.players?.length || 0}/11, 
                  Team 2 - {teams.team2?.players?.length || 0}/11
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Team Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Create New Team</h3>
              <button
                onClick={() => setShowAddTeamModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Name
                </label>
                <input
                  type="text"
                  value={newTeam.short_name}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, short_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., IND, AUS, ENG"
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 10 characters (optional)
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> After creating the team, you'll need to add players in the Player Management section.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddTeamModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddTeam}
                disabled={!newTeam.name.trim() || isSubmitting}
                className={`flex-1 py-2 px-4 bg-green-500 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  !newTeam.name.trim() || isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'hover:bg-green-600'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create Team</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SetupScreen;