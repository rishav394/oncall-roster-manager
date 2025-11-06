import { useState } from 'react';

export default function LeaveSelector({ members, leaves, onLeavesChange, startDate, endDate }) {
  const [showCustomLeave, setShowCustomLeave] = useState(false);
  const [dateSelectionMode, setDateSelectionMode] = useState('single'); // 'single', 'range', 'multiple'
  const [customLeave, setCustomLeave] = useState({
    member: '',
    date: '',
    startDate: '',
    endDate: '',
    selectedDates: [],
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

    if (dateSelectionMode === 'range') {
      // Date range mode
      if (!customLeave.startDate || !customLeave.endDate) {
        alert('Please select both start and end dates');
        return;
      }

      if (new Date(customLeave.startDate) > new Date(customLeave.endDate)) {
        alert('Start date must be before or equal to end date');
        return;
      }

      // Validate dates are within roster range
      if (startDate && endDate) {
        if (new Date(customLeave.startDate) < new Date(startDate) ||
            new Date(customLeave.endDate) > new Date(endDate)) {
          alert(`Custom leave dates must be within the roster date range (${startDate} to ${endDate})`);
          return;
        }
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
    } else if (dateSelectionMode === 'multiple') {
      // Multiple dates mode
      if (customLeave.selectedDates.length === 0) {
        alert('Please select at least one date');
        return;
      }

      // Create leave entries for each selected date
      customLeave.selectedDates.forEach((dateStr, index) => {
        newLeaves.push({
          id: Date.now() + Math.random() + index,
          type: 'custom',
          member: customLeave.member,
          date: dateStr,
          slot: customLeave.slot
        });
      });
    } else {
      // Single date mode
      if (!customLeave.date) {
        alert('Please select a date');
        return;
      }

      // Validate date is within roster range
      if (startDate && endDate) {
        if (new Date(customLeave.date) < new Date(startDate) ||
            new Date(customLeave.date) > new Date(endDate)) {
          alert(`Custom leave date must be within the roster date range (${startDate} to ${endDate})`);
          return;
        }
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
      selectedDates: [],
      slot: 'Both'
    });
    setShowCustomLeave(false);
  };

  // Add/remove date from multiple dates selection
  const handleToggleDate = (dateStr) => {
    const currentDates = customLeave.selectedDates;
    if (currentDates.includes(dateStr)) {
      setCustomLeave({
        ...customLeave,
        selectedDates: currentDates.filter(d => d !== dateStr)
      });
    } else {
      setCustomLeave({
        ...customLeave,
        selectedDates: [...currentDates, dateStr].sort()
      });
    }
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
      custom: `${leave.date} (${leave.slot})`
    };
    return types[leave.type] || leave.type;
  };

  // Group leaves by member
  const groupLeavesByMember = () => {
    const grouped = {};
    leaves.forEach(leave => {
      if (!grouped[leave.member]) {
        grouped[leave.member] = [];
      }
      grouped[leave.member].push(leave);
    });
    return grouped;
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
              <label className="text-sm text-gray-600">Date Selection:</label>
              <select
                value={dateSelectionMode}
                onChange={(e) => setDateSelectionMode(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="single">Single Date</option>
                <option value="range">Date Range</option>
                <option value="multiple">Multiple Dates</option>
              </select>
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
            {dateSelectionMode === 'range' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Start Date
                    {startDate && endDate && (
                      <span className="text-gray-500 ml-1 font-normal">
                        (within roster range)
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={customLeave.startDate}
                    onChange={(e) => setCustomLeave({ ...customLeave, startDate: e.target.value })}
                    min={startDate}
                    max={customLeave.endDate || endDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    End Date
                    {startDate && endDate && (
                      <span className="text-gray-500 ml-1 font-normal">
                        (within roster range)
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={customLeave.endDate}
                    onChange={(e) => setCustomLeave({ ...customLeave, endDate: e.target.value })}
                    min={customLeave.startDate || startDate}
                    max={endDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : dateSelectionMode === 'multiple' ? (
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Select Multiple Dates (e.g., 3, 6, 12, etc.)
                  <span className="text-gray-500 ml-1 font-normal">
                    {customLeave.selectedDates.length} date(s) selected
                  </span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="date"
                    min={startDate}
                    max={endDate}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleToggleDate(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setCustomLeave({ ...customLeave, selectedDates: [] })}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                  >
                    Clear All
                  </button>
                </div>
                {customLeave.selectedDates.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-300 rounded-md max-h-32 overflow-y-auto">
                    {customLeave.selectedDates.map(date => (
                      <span
                        key={date}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                      >
                        {date}
                        <button
                          onClick={() => handleToggleDate(date)}
                          className="hover:text-blue-900 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Date
                  {startDate && endDate && (
                    <span className="text-gray-500 ml-1 font-normal">
                      (within roster range)
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  value={customLeave.date}
                  onChange={(e) => setCustomLeave({ ...customLeave, date: e.target.value })}
                  min={startDate}
                  max={endDate}
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
            {dateSelectionMode === 'range' ? 'Add Date Range Leave' :
             dateSelectionMode === 'multiple' ? `Add Leave for ${customLeave.selectedDates.length} Date(s)` :
             'Add Custom Leave'}
          </button>
        </div>
      )}

      {/* Leaves List */}
      {leaves.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-3 text-gray-700">Active Leaves:</h3>
          <div className="space-y-4">
            {Object.entries(groupLeavesByMember()).map(([member, memberLeaves]) => (
              <div key={member} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Member Header */}
                <div className="bg-gradient-to-r from-blue-100 to-blue-50 px-4 py-2 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">
                      {member}
                      <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        {memberLeaves.length} {memberLeaves.length === 1 ? 'leave' : 'leaves'}
                      </span>
                    </h4>
                    <button
                      onClick={() => {
                        // Remove all leaves for this member
                        const remainingLeaves = leaves.filter(l => l.member !== member);
                        onLeavesChange(remainingLeaves);
                      }}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove All
                    </button>
                  </div>
                </div>

                {/* Member's Leaves */}
                <div className="bg-white divide-y divide-gray-100">
                  {memberLeaves.map(leave => (
                    <div
                      key={leave.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          leave.type === 'custom' ? 'bg-purple-100 text-purple-700' :
                          leave.type === 'allMorning' ? 'bg-blue-100 text-blue-700' :
                          leave.type === 'allEvening' ? 'bg-green-100 text-green-700' :
                          leave.type === 'weekend' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {leave.type === 'custom' ? 'Custom' :
                           leave.type === 'allMorning' ? 'All Morning' :
                           leave.type === 'allEvening' ? 'All Evening' :
                           leave.type === 'weekend' ? 'Weekend' :
                           'Complete'}
                        </span>
                        <span className="text-sm text-gray-700">
                          {formatLeaveDescription(leave)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveLeave(leave.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
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
