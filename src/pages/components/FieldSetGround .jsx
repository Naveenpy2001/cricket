import { useState, useRef } from 'react';

const FieldSetGround = () => {
  // State for fielders and their positions
  const [fielders, setFielders] = useState([
    { id: 1, name: 'Slip 1', x: 110, y: 100, color: 'bg-blue-500' },
    { id: 2, name: 'Slip 2', x: 130, y: 120, color: 'bg-blue-600' },
    { id: 3, name: 'Gully', x: 90, y: 130, color: 'bg-blue-700' },
    { id: 4, name: 'Point', x: 70, y: 170, color: 'bg-blue-800' },
    { id: 5, name: 'Cover', x: 130, y: 190, color: 'bg-indigo-500' },
    { id: 6, name: 'Mid-off', x: 180, y: 150, color: 'bg-indigo-600' },
    { id: 7, name: 'Mid-on', x: 180, y: 200, color: 'bg-indigo-700' },
    { id: 8, name: 'Mid-wicket', x: 220, y: 190, color: 'bg-purple-500' },
    { id: 9, name: 'Square Leg', x: 220, y: 120, color: 'bg-purple-600' },
    { id: 10, name: 'Fine Leg', x: 230, y: 80, color: 'bg-purple-700' },
    { id: 11, name: 'Third Man', x: 70, y: 80, color: 'bg-purple-800' }
  ]);

  // State for ball trajectory
  const [ballTrajectory, setBallTrajectory] = useState(null);
  const [fielderMovement, setFielderMovement] = useState(null);
  const [draggingFielder, setDraggingFielder] = useState(null);
  const svgRef = useRef(null);

  // Bowler types and their field settings
  const bowlerTypes = [
    { id: 'fast', name: 'Fast Bowler', fieldPreset: 'aggressive' },
    { id: 'medium', name: 'Medium Pacer', fieldPreset: 'standard' },
    { id: 'spin', name: 'Spinner', fieldPreset: 'defensive' },
    { id: 'legspin', name: 'Leg Spinner', fieldPreset: 'legside' },
    { id: 'offspin', name: 'Off Spinner', fieldPreset: 'offside' }
  ];

  const [selectedBowler, setSelectedBowler] = useState('fast');
  const [selectedFieldPreset, setSelectedFieldPreset] = useState('aggressive');

  // Field presets for different bowler types
  const fieldPresets = {
    aggressive: [
      { id: 1, name: 'Slip 1', x: 110, y: 100, color: 'bg-blue-500' },
      { id: 2, name: 'Slip 2', x: 130, y: 120, color: 'bg-blue-600' },
      { id: 3, name: 'Gully', x: 90, y: 130, color: 'bg-blue-700' },
      { id: 4, name: 'Point', x: 70, y: 170, color: 'bg-blue-800' },
      { id: 5, name: 'Cover', x: 130, y: 190, color: 'bg-indigo-500' },
      { id: 6, name: 'Mid-off', x: 180, y: 150, color: 'bg-indigo-600' },
      { id: 7, name: 'Mid-on', x: 180, y: 200, color: 'bg-indigo-700' },
      { id: 8, name: 'Mid-wicket', x: 220, y: 190, color: 'bg-purple-500' },
      { id: 9, name: 'Square Leg', x: 220, y: 120, color: 'bg-purple-600' },
      { id: 10, name: 'Fine Leg', x: 230, y: 80, color: 'bg-purple-700' },
      { id: 11, name: 'Third Man', x: 70, y: 80, color: 'bg-purple-800' }
    ],
    defensive: [
      { id: 1, name: 'Slip 1', x: 120, y: 110, color: 'bg-blue-500' },
      { id: 2, name: 'Slip 2', x: 140, y: 130, color: 'bg-blue-600' },
      { id: 3, name: 'Gully', x: 100, y: 140, color: 'bg-blue-700' },
      { id: 4, name: 'Point', x: 80, y: 180, color: 'bg-blue-800' },
      { id: 5, name: 'Cover', x: 140, y: 200, color: 'bg-indigo-500' },
      { id: 6, name: 'Mid-off', x: 190, y: 160, color: 'bg-indigo-600' },
      { id: 7, name: 'Mid-on', x: 190, y: 210, color: 'bg-indigo-700' },
      { id: 8, name: 'Mid-wicket', x: 230, y: 200, color: 'bg-purple-500' },
      { id: 9, name: 'Square Leg', x: 230, y: 130, color: 'bg-purple-600' },
      { id: 10, name: 'Fine Leg', x: 240, y: 90, color: 'bg-purple-700' },
      { id: 11, name: 'Third Man', x: 80, y: 90, color: 'bg-purple-800' }
    ],
    standard: [
      { id: 1, name: 'Slip 1', x: 115, y: 105, color: 'bg-blue-500' },
      { id: 2, name: 'Slip 2', x: 135, y: 125, color: 'bg-blue-600' },
      { id: 3, name: 'Gully', x: 95, y: 135, color: 'bg-blue-700' },
      { id: 4, name: 'Point', x: 75, y: 175, color: 'bg-blue-800' },
      { id: 5, name: 'Cover', x: 135, y: 195, color: 'bg-indigo-500' },
      { id: 6, name: 'Mid-off', x: 185, y: 155, color: 'bg-indigo-600' },
      { id: 7, name: 'Mid-on', x: 185, y: 205, color: 'bg-indigo-700' },
      { id: 8, name: 'Mid-wicket', x: 225, y: 195, color: 'bg-purple-500' },
      { id: 9, name: 'Square Leg', x: 225, y: 125, color: 'bg-purple-600' },
      { id: 10, name: 'Fine Leg', x: 235, y: 85, color: 'bg-purple-700' },
      { id: 11, name: 'Third Man', x: 75, y: 85, color: 'bg-purple-800' }
    ],
    legside: [
      { id: 1, name: 'Slip 1', x: 120, y: 110, color: 'bg-blue-500' },
      { id: 2, name: 'Slip 2', x: 140, y: 130, color: 'bg-blue-600' },
      { id: 3, name: 'Gully', x: 100, y: 140, color: 'bg-blue-700' },
      { id: 4, name: 'Point', x: 85, y: 180, color: 'bg-blue-800' },
      { id: 5, name: 'Cover', x: 145, y: 200, color: 'bg-indigo-500' },
      { id: 6, name: 'Mid-off', x: 195, y: 160, color: 'bg-indigo-600' },
      { id: 7, name: 'Mid-on', x: 170, y: 210, color: 'bg-indigo-700' },
      { id: 8, name: 'Mid-wicket', x: 210, y: 200, color: 'bg-purple-500' },
      { id: 9, name: 'Square Leg', x: 200, y: 130, color: 'bg-purple-600' },
      { id: 10, name: 'Fine Leg', x: 220, y: 90, color: 'bg-purple-700' },
      { id: 11, name: 'Third Man', x: 90, y: 90, color: 'bg-purple-800' }
    ],
    offside: [
      { id: 1, name: 'Slip 1', x: 110, y: 100, color: 'bg-blue-500' },
      { id: 2, name: 'Slip 2', x: 130, y: 120, color: 'bg-blue-600' },
      { id: 3, name: 'Gully', x: 90, y: 130, color: 'bg-blue-700' },
      { id: 4, name: 'Point', x: 65, y: 170, color: 'bg-blue-800' },
      { id: 5, name: 'Cover', x: 125, y: 190, color: 'bg-indigo-500' },
      { id: 6, name: 'Mid-off', x: 175, y: 150, color: 'bg-indigo-600' },
      { id: 7, name: 'Mid-on', x: 190, y: 200, color: 'bg-indigo-700' },
      { id: 8, name: 'Mid-wicket', x: 230, y: 190, color: 'bg-purple-500' },
      { id: 9, name: 'Square Leg', x: 240, y: 120, color: 'bg-purple-600' },
      { id: 10, name: 'Fine Leg', x: 240, y: 80, color: 'bg-purple-700' },
      { id: 11, name: 'Third Man', x: 60, y: 80, color: 'bg-purple-800' }
    ]
  };

  // Handle ball click to set trajectory
  const handleBallClick = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setBallTrajectory({ x, y });
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
    setFielderMovement({ x, y });
  };

  // Handle fielder drop
  const handleFielderDrop = () => {
    if (!draggingFielder || !fielderMovement) return;
    
    setFielders(fielders.map(fielder => 
      fielder.id === draggingFielder 
        ? { ...fielder, x: fielderMovement.x, y: fielderMovement.y }
        : fielder
    ));
    
    setDraggingFielder(null);
    setFielderMovement(null);
  };

  // Apply field settings based on bowler type
  const applyFieldSettings = (bowlerType, preset) => {
    setSelectedBowler(bowlerType);
    setSelectedFieldPreset(preset);
    setFielders(fieldPresets[preset]);
    setBallTrajectory(null);
  };

  // Handle bowler change
  const handleBowlerChange = (e) => {
    const bowlerType = e.target.value;
    const preset = bowlerTypes.find(b => b.id === bowlerType)?.fieldPreset || 'standard';
    applyFieldSettings(bowlerType, preset);
  };

  // Handle field preset change
  const handleFieldPresetChange = (e) => {
    const preset = e.target.value;
    setSelectedFieldPreset(preset);
    setFielders(fieldPresets[preset]);
  };

  // Save current field configuration
  const saveFieldConfiguration = () => {
    // In a real app, you would save this to a database or state management
    console.log("Field configuration saved:", {
      bowlerType: selectedBowler,
      fieldPreset: selectedFieldPreset,
      fielders: fielders
    });
    
    alert(`Field configuration saved for ${bowlerTypes.find(b => b.id === selectedBowler)?.name}`);
  };

  return (
    <div className="xl:col-span-2 bg-white rounded-xl shadow-md p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Field Position Configuration
      </h3>
      
      {/* Bowler and Field Preset Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bowler Type</label>
          <select 
            value={selectedBowler}
            onChange={handleBowlerChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            {bowlerTypes.map((bowler) => (
              <option key={bowler.id} value={bowler.id}>{bowler.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Field Preset</label>
          <select 
            value={selectedFieldPreset}
            onChange={handleFieldPresetChange}
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
          
          {/* Fielders */}
          {fielders.map(fielder => (
            <g key={fielder.id}>
              <circle
                cx={fielder.x}
                cy={fielder.y}
                r="10"
                fill={fielder.color.includes('blue') ? '#3b82f6' : 
                      fielder.color.includes('indigo') ? '#6366f1' : 
                      fielder.color.includes('purple') ? '#8b5cf6' : '#22c55e'}
                stroke="#fff"
                strokeWidth="2"
                className="cursor-move hover:opacity-80 transition-opacity"
                onMouseDown={(e) => handleFielderDrag(e, fielder.id)}
              />
              <text
                x={fielder.x}
                y={fielder.y - 15}
                textAnchor="middle"
                className="text-xs fill-gray-700 pointer-events-none font-semibold"
              >
                {fielder.name.split(' ').map(n => n[0]).join('')}
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
        
        {/* Save Button */}
        <div className="absolute top-2 right-2">
          <button 
            onClick={saveFieldConfiguration}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-md flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Field
          </button>
        </div>
      </div>
      
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
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Select bowler type and field preset to adjust field settings
        </p>
      </div>
    </div>
  );
};

export default FieldSetGround;