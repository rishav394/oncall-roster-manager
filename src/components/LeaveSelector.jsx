import { useState } from 'react';

export default function LeaveSelector({ members, leaves, onLeavesChange }) {
  const [showCustomLeave, setShowCustomLeave] = useState(false);
  const [dateRangeMode, setDateRangeMode] = useState(false);
  const [customLeave, setCustomLeave] = useState({
    member: '',
    date: '',
    startDate: '',
    endDate: '',
    slot: 'Both'
  });

  const handleAddLeave = (type, member = null) => {
    if (!member && members.length === 0) {
      alert('Please add team members first');
      return;
    }

    const newLeave = {
      id: Date.now(),
      type,
      member: member || members[0]
    };

    onLeavesChange([...leaves, newLeave]);
  };

  const handleAddCustomLeave = () => {
    if (!customLeave.member) {
      alert('Please select a member');
      return;
    }

    const newLeaves = [...leaves];

    if (dateRangeMode) {
      // Date range mode
      if (!customLeave.startDate || !customLeave.endDate) {
        alert('Please select both start and end dates');
        return;
      }

      if (new Date(customLeave.startDate) > new Date(customLeave.endDate)) {
        alert('Start date must be before or equal to end date');
        return;
      }

      // Create leave entries for each date in the range
      const start = new Date(customLeave.startDate);
      const end = new Date(customLeave.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        newLeaves.push({
          id: Date.now() + Math.random(), // Unique ID for each date
          type: 'custom',
          member: customLeave.member,
          date: dateStr,
          slot: customLeave.slot
        });
      }
    } else {
      // Single date mode
      if (!customLeave.date) {
        alert('Please select a date');
        return;
      }

      newLeaves.push({
        id: Date.now(),
        type: 'custom',
        member: customLeave.member,
        date: customLeave.date,
        slot: customLeave.slot
      });
    }

    onLeavesChange(newLeaves);
    setCustomLeave({
      member: members[0] || '',
      date: '',
      startDate: '',
      endDate: '',
      slot: 'Both'
    });
    setShowCustomLeave(false);
  };

  const handleRemoveLeave = (id) => {
    onLeavesChange(leaves.filter(leave => leave.id !== id));
  };

  const formatLeaveDescription = (leave) => {
    const types = {
      allMorning: 'All Mornings',
      allEvening: 'All Evenings',
      complete: 'Complete Leave',
      weekend: 'Weekend Leave',
      custom: `Custom: ${leave.date} (${leave.slot})`
    };
    return `${leave.member} - ${types[leave.type] || leave.type}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Leave Settings</h2>

      {/* Quick Leave Buttons */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Add Leave:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              if (e.target.value) {
                handleAddLeave('allMorning', e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>All Morning Leave</option>
            {members.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              if (e.target.value) {
                handleAddLeave('allEvening', e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>All Evening Leave</option>
            {members.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              if (e.target.value) {
                handleAddLeave('complete', e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>Complete Leave</option>
            {members.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              if (e.target.value) {
                handleAddLeave('weekend', e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>Weekend Leave</option>
            {members.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>

          <button
            onClick={() => setShowCustomLeave(!showCustomLeave)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors md:col-span-2"
          >
            {showCustomLeave ? 'Hide Custom' : '+ Custom Leave'}
          </button>
        </div>
      </div>

      {/* Custom Leave Form */}
      {showCustomLeave && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Add Custom Leave</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Date Range Mode:</label>
              <button
                onClick={() => setDateRangeMode(!dateRangeMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  dateRangeMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    dateRangeMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Member Selection */}
            <select
              value={customLeave.member}
              onChange={(e) => setCustomLeave({ ...customLeave, member: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Member</option>
              {members.map(member => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>

            {/* Date Selection */}
            {dateRangeMode ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customLeave.startDate}
                    onChange={(e) => setCustomLeave({ ...customLeave, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customLeave.endDate}
                    onChange={(e) => setCustomLeave({ ...customLeave, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={customLeave.date}
                  onChange={(e) => setCustomLeave({ ...customLeave, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Slot Selection */}
            <select
              value={customLeave.slot}
              onChange={(e) => setCustomLeave({ ...customLeave, slot: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Both">Both Slots</option>
            </select>
          </div>

          <button
            onClick={handleAddCustomLeave}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full md:w-auto"
          >
            {dateRangeMode ? 'Add Date Range Leave' : 'Add Custom Leave'}
          </button>
        </div>
      )}

      {/* Leaves List */}
      {leaves.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2 text-gray-700">Active Leaves:</h3>
          <div className="space-y-2">
            {leaves.map(leave => (
              <div
                key={leave.id}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200"
              >
                <span className="text-sm text-gray-700">
                  {formatLeaveDescription(leave)}
                </span>
                <button
                  onClick={() => handleRemoveLeave(leave.id)}
                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {leaves.length === 0 && (
        <p className="text-sm text-gray-500 mt-4 italic">No leaves added yet</p>
      )}
    </div>
  );
}
