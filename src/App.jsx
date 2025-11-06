import { useState, useEffect, useRef } from 'react';
import LeaveSelector from './components/LeaveSelector';
import RosterTable from './components/RosterTable';
import { generateRoster, formatRosterTable } from './utils/generateRoster';
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage } from './utils/localStorage';
import { exportToYAML, importFromYAML } from './utils/yamlConfig';

function App() {
  // Get today's date and 7 days from now as defaults
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [membersInput, setMembersInput] = useState('');
  const [members, setMembers] = useState([]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  const [leaves, setLeaves] = useState([]);
  const [rosterData, setRosterData] = useState([]);
  const fileInputRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      setMembersInput(saved.membersInput || '');
      setMembers(saved.members || []);
      setStartDate(saved.startDate || today);
      setEndDate(saved.endDate || nextWeek);
      setLeaves(saved.leaves || []);
      // Don't restore roster - let user regenerate
    }
  }, []);

  // Save to localStorage whenever inputs change
  useEffect(() => {
    const dataToSave = {
      membersInput,
      members,
      startDate,
      endDate,
      leaves
    };
    saveToLocalStorage(dataToSave);
  }, [membersInput, members, startDate, endDate, leaves]);

  const handleMembersChange = (e) => {
    const value = e.target.value;
    setMembersInput(value);

    // Parse members from textarea (one per line)
    const parsedMembers = value
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    setMembers(parsedMembers);
  };

  const handleGenerateRoster = () => {
    if (members.length === 0) {
      alert('Please add team members first');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date must be before or equal to end date');
      return;
    }

    // Generate roster
    const assignments = generateRoster(members, startDate, endDate, leaves);
    const formattedRoster = formatRosterTable(assignments);
    setRosterData(formattedRoster);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      setMembersInput('');
      setMembers([]);
      setStartDate(today);
      setEndDate(nextWeek);
      setLeaves([]);
      setRosterData([]);
      clearLocalStorage();
    }
  };

  const handleExportConfig = () => {
    const config = {
      members,
      startDate,
      endDate,
      leaves
    };
    exportToYAML(config);
  };

  const handleImportConfig = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const config = await importFromYAML(file);

      // Update state with imported config
      setMembers(config.members);
      setMembersInput(config.members.join('\n'));
      setStartDate(config.startDate);
      setEndDate(config.endDate);
      setLeaves(config.leaves);
      setRosterData([]); // Clear roster to regenerate

      alert('Configuration imported successfully!');
    } catch (error) {
      alert(error.message);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Oncall Roster Scheduler
          </h1>
          <p className="text-gray-600">
            Generate balanced oncall rosters with automatic conflict resolution
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Team Members */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Members (one per line)
              </label>
              <textarea
                value={membersInput}
                onChange={handleMembersChange}
                placeholder="Alice&#10;Bob&#10;Carol"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              />
              <p className="text-xs text-gray-500 mt-1">
                {members.length} member{members.length !== 1 ? 's' : ''} added
              </p>
            </div>

            {/* Date Range */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex gap-4">
                  <button
                    onClick={handleGenerateRoster}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Generate Roster
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                {/* Export/Import Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleExportConfig}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Export Config (YAML)
                  </button>
                  <label className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Import Config (YAML)
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".yaml,.yml"
                      onChange={handleImportConfig}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Selector */}
        <div className="mb-6">
          <LeaveSelector
            members={members}
            leaves={leaves}
            onLeavesChange={setLeaves}
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        {/* Roster Table */}
        <RosterTable rosterData={rosterData} />

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Each day has two slots: Morning and Evening</li>
            <li>Each member must have at least 2 slots gap between consecutive oncalls</li>
            <li>The algorithm balances workload evenly across all team members</li>
            <li>Leaves are automatically respected during roster generation</li>
            <li>Your settings are automatically saved locally</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
