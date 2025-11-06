import { useState, useEffect } from 'react';
import LeaveSelector from './components/LeaveSelector';
import RosterTable from './components/RosterTable';
import { generateRoster, formatRosterTable } from './utils/generateRoster';
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage } from './utils/localStorage';

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
              <div className="md:col-span-2 flex gap-4">
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
