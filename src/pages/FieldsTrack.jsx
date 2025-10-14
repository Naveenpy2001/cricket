import { useState } from 'react';

function CricketFieldingTracker() {
  const [teams] = useState({
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

  const [fieldingEvents, setFieldingEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedFielder, setSelectedFielder] = useState('');
  const [customFielder, setCustomFielder] = useState('');
  const [fieldingStatus, setFieldingStatus] = useState('');
  const [savedRuns, setSavedRuns] = useState(0);
  const [givenRuns, setGivenRuns] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fielding status suggestions
  const statusSuggestions = [
    "Catch taken",
    "Catch dropped",
    "Run out",
    "Direct hit",
    "Missed run out",
    "Boundary saved",
    "Good fielding",
    "Poor fielding",
    "Stumping chance",
    "Diving stop"
  ];

  const allPlayers = [...teams.team1.players, ...teams.team2.players];
  

  const handleSaveEvent = () => {
    const fielderName = selectedFielder === 'custom' ? customFielder : 
                        allPlayers.find(p => p.id === parseInt(selectedFielder))?.displayName || '';
    
    if (!fielderName || !fieldingStatus) {
      alert('Please select a fielder and enter fielding status');
      return;
    }

    const newEvent = {
      id: Date.now(),
      fielder: fielderName,
      status: fieldingStatus,
      savedRuns: parseInt(savedRuns) || 0,
      givenRuns: parseInt(givenRuns) || 0,
      timestamp: new Date().toLocaleTimeString()
    };

    setFieldingEvents([...fieldingEvents, newEvent]);
    
    // Reset form and close popup
    setSelectedFielder('');
    setCustomFielder('');
    setFieldingStatus('');
    setSavedRuns(0);
    setGivenRuns(0);
    setShowEventForm(false);
  };

  const handleDeleteEvent = (id) => {
    setFieldingEvents(fieldingEvents.filter(event => event.id !== id));
  };

  const filteredSuggestions = fieldingStatus 
    ? statusSuggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(fieldingStatus.toLowerCase()))
    : statusSuggestions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Cricket Fielding Event Tracker</h1>
            <p className="text-gray-600">Track fielding performances including saved runs and given runs</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teams Section */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-blue-200">Teams</h2>
              
              <div className="space-y-6">
                {/* Team 1 */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">{teams.team1.name}</h3>
                  <div className="space-y-2">
                    {teams.team1.players.map(player => (
                      <div key={player.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                        <div>
                          <span className="font-medium text-gray-800">{player.displayName}</span>
                          <span className="text-sm text-gray-600 ml-2">({player.role})</span>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                          {player.bowlerType || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Team 2 */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">{teams.team2.name}</h3>
                  <div className="space-y-2">
                    {teams.team2.players.map(player => (
                      <div key={player.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                        <div>
                          <span className="font-medium text-gray-800">{player.displayName}</span>
                          <span className="text-sm text-gray-600 ml-2">({player.role})</span>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                          {player.bowlerType || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Event List Section */}
            <div>
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Fielding Events</h2>
                <button 
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md flex items-center"
                  onClick={() => setShowEventForm(true)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Event
                </button>
              </div>
              
              {fieldingEvents.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-yellow-800">No events recorded yet</h3>
                  <p className="mt-2 text-yellow-700">Add fielding events using the button above</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {fieldingEvents.map(event => (
                    <div key={event.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{event.fielder}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 py-1 px-2 rounded-full">
                              {event.timestamp}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-2">{event.status}</p>
                          <div className="flex space-x-5 mt-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${event.savedRuns > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              <svg className="-ml-1 mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Saved: {event.savedRuns} runs
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${event.givenRuns > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                              <svg className="-ml-1 mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Given: {event.givenRuns} runs
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="ml-4 text-red-500 hover:text-red-700 transition"
                          aria-label="Delete event"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Form Popup */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add Fielding Event</h2>
                <button 
                  onClick={() => setShowEventForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Fielder</label>
                  <select 
                    value={selectedFielder}
                    onChange={(e) => setSelectedFielder(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Choose a player</option>
                    <optgroup label="Leicestershire">
                      {teams.team1.players.map(player => (
                        <option key={player.id} value={player.id}>{player.displayName}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Essex">
                      {teams.team2.players.map(player => (
                        <option key={player.id} value={player.id}>{player.displayName}</option>
                      ))}
                    </optgroup>
                    <option value="custom">Custom (type name)</option>
                  </select>
                </div>
                
                {selectedFielder === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Fielder Name</label>
                    <input 
                      type="text" 
                      value={customFielder}
                      onChange={(e) => setCustomFielder(e.target.value)}
                      placeholder="Enter fielder name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                )}
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fielding Status</label>
                  <input 
                    type="text" 
                    value={fieldingStatus}
                    onChange={(e) => setFieldingStatus(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Type or select a status"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  
                  {showSuggestions && fieldingStatus && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredSuggestions.map((suggestion, index) => (
                        <div 
                          key={index}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            setFieldingStatus(suggestion);
                            setShowSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Runs Saved</label>
                    <input 
                      type="number" 
                      value={savedRuns}
                      onChange={(e) => setSavedRuns(e.target.value)}
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Runs Given</label>
                    <input 
                      type="number" 
                      value={givenRuns}
                      onChange={(e) => setGivenRuns(e.target.value)}
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setShowEventForm(false)}
                    className="flex-1 bg-gray-300 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveEvent}
                    className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors shadow-md"
                  >
                    Save Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CricketFieldingTracker;