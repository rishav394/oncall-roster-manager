import { useState } from 'react';

export default function LeaveSelector({ members, leaves, onLeavesChange }) {
  const [showCustomLeave, setShowCustomLeave] = useState(false);
  const [customLeave, setCustomLeave] = useState({
    member: '',
    date: '',
    slot: 'Morning'
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
    if (!customLeave.member || !customLeave.date) {
      alert('Please select member and date');
      return;
    }

    const newLeave = {
      id: Date.now(),
      type: 'custom',
      member: customLeave.member,
      date: customLeave.date,
      slot: customLeave.slot
    };

    onLeavesChange([...leaves, newLeave]);
    setCustomLeave({ member: members[0] || '', date: '', slot: 'Morning' });
    setShowCustomLeave(false);
  };

  const handleRemoveLeave = (id) => {
    onLeavesChange(leaves.filter(leave => leave.id !== id));
  };

  const formatLeaveDescription = (leave) => {
    const types = {
      allMorning: 'All Mornings',
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
        <div className="grid grid-cols-2 gap-2">
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
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            {showCustomLeave ? 'Hide Custom' : '+ Custom Leave'}
          </button>
        </div>
      </div>

      {/* Custom Leave Form */}
      {showCustomLeave && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="font-semibold mb-3 text-gray-700">Add Custom Leave</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

            <input
              type="date"
              value={customLeave.date}
              onChange={(e) => setCustomLeave({ ...customLeave, date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={customLeave.slot}
              onChange={(e) => setCustomLeave({ ...customLeave, slot: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <button
            onClick={handleAddCustomLeave}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Custom Leave
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
