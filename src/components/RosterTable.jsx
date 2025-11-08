import { useState } from 'react';
import { exportToCSV } from '../utils/exportCSV';
import CalendarView from './CalendarView';

export default function RosterTable({ rosterData }) {
  const [viewMode, setViewMode] = useState('calendar'); // 'table' or 'calendar'

  const handleExport = () => {
    exportToCSV(rosterData);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6 ? 'weekend' : 'weekday';
  };

  // Calculate workload per member
  const calculateWorkload = () => {
    const workload = {};

    const addToWorkload = (member, primarySlots, secondarySlots, primaryLoad, secondaryLoad) => {
      if (!workload[member]) {
        workload[member] = { primarySlots: 0, secondarySlots: 0, primaryLoad: 0, secondaryLoad: 0 };
      }
      workload[member].primarySlots += primarySlots;
      workload[member].secondarySlots += secondarySlots;
      workload[member].primaryLoad += primaryLoad;
      workload[member].secondaryLoad += secondaryLoad;
    };

    rosterData.forEach((row) => {
      if (row.isWeekend) {
        // Weekend primary
        if (row.weekend && row.weekend !== '—') {
          addToWorkload(row.weekend, 1, 0, 2, 0); // 1 primary slot, 2 primary load
        }
        // Weekend secondary
        if (row.weekendSecondary && row.weekendSecondary !== '—') {
          addToWorkload(row.weekendSecondary, 0, 1, 0, 1); // 1 secondary slot, 1 secondary load
        }
      } else {
        // Morning primary
        if (row.morning && row.morning !== '—') {
          addToWorkload(row.morning, 1, 0, 1, 0);
        }
        // Morning secondary
        if (row.morningSecondary && row.morningSecondary !== '—') {
          addToWorkload(row.morningSecondary, 0, 1, 0, 0.5);
        }
        // Evening primary
        if (row.evening && row.evening !== '—') {
          addToWorkload(row.evening, 1, 0, 1, 0);
        }
        // Evening secondary
        if (row.eveningSecondary && row.eveningSecondary !== '—') {
          addToWorkload(row.eveningSecondary, 0, 1, 0, 0.5);
        }
      }
    });

    return workload;
  };

  const workload = calculateWorkload();
  const maxPrimaryLoad = Math.max(...Object.values(workload).map(w => w.primaryLoad), 1);
  const maxSecondaryLoad = Math.max(...Object.values(workload).map(w => w.secondaryLoad), 1);
  const maxTotalLoad = Math.max(...Object.values(workload).map(w => w.primaryLoad + w.secondaryLoad), 1);

  if (!rosterData || rosterData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Roster View</h2>
        <p className="text-gray-500 italic text-center py-8">
          No roster generated yet. Fill in the details above and click "Generate Roster"
        </p>
      </div>
    );
  }

  // If calendar view is selected, show CalendarView component
  if (viewMode === 'calendar') {
    return (
      <div className="space-y-4">
        {/* View Toggle and Export */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md transition-colors font-medium ${
                  viewMode === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Calendar
                </span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md transition-colors font-medium ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Table
                </span>
              </button>
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download CSV
            </button>
          </div>
        </div>

        {/* Calendar View */}
        <CalendarView rosterData={rosterData} />

        {/* Workload Summary for Calendar View */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Workload Distribution
            </div>
            <div className="text-xs text-gray-600 font-normal ml-5">
              Load: Primary Weekday=1.0, Primary Weekend=2.0, Secondary Weekday=0.5, Secondary Weekend=1.0
            </div>
          </h3>

          {Object.keys(workload).length === 0 ? (
            <p className="text-sm text-gray-500 italic">No assignments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Member</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Primary Slots</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Primary Load</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Secondary Slots</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Secondary Load</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Total Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(workload)
                    .sort((a, b) => (b[1].primaryLoad + b[1].secondaryLoad) - (a[1].primaryLoad + a[1].secondaryLoad))
                    .map(([member, data]) => {
                      const totalLoad = data.primaryLoad + data.secondaryLoad;
                      const percentage = (totalLoad / maxTotalLoad) * 100;
                      return (
                        <tr key={member} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium text-gray-800">{member}</td>
                          <td className="py-2 px-3 text-center text-gray-600">{data.primarySlots}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                              {data.primaryLoad.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center text-gray-600">{data.secondarySlots}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-semibold">
                              {data.secondaryLoad.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 w-10 text-right">{percentage.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Table view
  return (
    <div className="space-y-4">
      {/* View Toggle and Export */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md transition-colors font-medium ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Calendar
              </span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-md transition-colors font-medium ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Table
              </span>
            </button>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download CSV
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Roster Table</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Morning / Weekend
                <span className="block text-xs font-normal text-gray-400 mt-1">Primary (Secondary)</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Evening
                <span className="block text-xs font-normal text-gray-400 mt-1">Primary (Secondary)</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rosterData.map((row, index) => {
              const isWeekend = row.isWeekend;
              return (
                <tr
                  key={index}
                  className={isWeekend ? 'bg-blue-50' : 'hover:bg-gray-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatDate(row.date)}
                    {isWeekend && (
                      <span className="ml-2 text-xs text-blue-600 font-semibold">WEEKEND</span>
                    )}
                  </td>
                  {isWeekend ? (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-700" colSpan="2">
                        <div className="flex flex-col gap-1">
                          <div>
                            <span className={row.weekend === '—' ? 'text-red-500 font-semibold' : 'bg-purple-100 px-3 py-1 rounded-full'}>
                              {row.weekend}
                            </span>
                            {row.weekend !== '—' && <span className="text-xs text-gray-500 ml-2">(Primary)</span>}
                          </div>
                          {row.weekendSecondary && row.weekendSecondary !== '—' && (
                            <div>
                              <span className="bg-purple-50 px-3 py-1 rounded-full text-gray-600">
                                {row.weekendSecondary}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">(Secondary)</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex flex-col gap-1">
                          <div>
                            <span className={row.morning === '—' ? 'text-red-500 font-semibold' : 'bg-blue-100 px-3 py-1 rounded-full'}>
                              {row.morning}
                            </span>
                            {row.morning !== '—' && <span className="text-xs text-gray-500 ml-2">(P)</span>}
                          </div>
                          {row.morningSecondary && row.morningSecondary !== '—' && (
                            <div>
                              <span className="bg-blue-50 px-3 py-1 rounded-full text-gray-600">
                                {row.morningSecondary}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">(S)</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex flex-col gap-1">
                          <div>
                            <span className={row.evening === '—' ? 'text-red-500 font-semibold' : 'bg-green-100 px-3 py-1 rounded-full'}>
                              {row.evening}
                            </span>
                            {row.evening !== '—' && <span className="text-xs text-gray-500 ml-2">(P)</span>}
                          </div>
                          {row.eveningSecondary && row.eveningSecondary !== '—' && (
                            <div>
                              <span className="bg-green-50 px-3 py-1 rounded-full text-gray-600">
                                {row.eveningSecondary}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">(S)</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Statistics */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-semibold text-gray-700 mb-2">Statistics (Primary POC)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Days</p>
            <p className="text-lg font-bold text-gray-800">{rosterData.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Primary Slots</p>
            <p className="text-lg font-bold text-gray-800">
              {rosterData.reduce((total, row) => {
                return total + (row.isWeekend ? 1 : 2);
              }, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unfilled Primary</p>
            <p className="text-lg font-bold text-red-600">
              {rosterData.reduce((count, row) => {
                if (row.isWeekend) {
                  return count + (row.weekend === '—' ? 1 : 0);
                }
                return count + (row.morning === '—' ? 1 : 0) + (row.evening === '—' ? 1 : 0);
              }, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Primary Coverage</p>
            <p className="text-lg font-bold text-green-600">
              {(() => {
                const totalSlots = rosterData.reduce((total, row) => total + (row.isWeekend ? 1 : 2), 0);
                const filledSlots = rosterData.reduce((count, row) => {
                  if (row.isWeekend) {
                    return count + (row.weekend !== '—' ? 1 : 0);
                  }
                  return count + (row.morning !== '—' ? 1 : 0) + (row.evening !== '—' ? 1 : 0);
                }, 0);
                return totalSlots > 0 ? ((filledSlots / totalSlots) * 100).toFixed(1) : 0;
              })()}%
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-600">Secondary Filled</p>
            <p className="text-lg font-bold text-blue-600">
              {rosterData.reduce((count, row) => {
                if (row.isWeekend) {
                  return count + (row.weekendSecondary && row.weekendSecondary !== '—' ? 1 : 0);
                }
                return count +
                  (row.morningSecondary && row.morningSecondary !== '—' ? 1 : 0) +
                  (row.eveningSecondary && row.eveningSecondary !== '—' ? 1 : 0);
              }, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Secondary Coverage</p>
            <p className="text-lg font-bold text-blue-600">
              {(() => {
                const totalSlots = rosterData.reduce((total, row) => total + (row.isWeekend ? 1 : 2), 0);
                const filledSecondary = rosterData.reduce((count, row) => {
                  if (row.isWeekend) {
                    return count + (row.weekendSecondary && row.weekendSecondary !== '—' ? 1 : 0);
                  }
                  return count +
                    (row.morningSecondary && row.morningSecondary !== '—' ? 1 : 0) +
                    (row.eveningSecondary && row.eveningSecondary !== '—' ? 1 : 0);
                }, 0);
                return totalSlots > 0 ? ((filledSecondary / totalSlots) * 100).toFixed(1) : 0;
              })()}%
            </p>
          </div>
        </div>

        {/* Workload Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Workload Distribution
            </div>
            <div className="text-xs text-gray-600 font-normal ml-5">
              Load: Primary Weekday=1.0, Primary Weekend=2.0, Secondary Weekday=0.5, Secondary Weekend=1.0
            </div>
          </h3>

          {Object.keys(workload).length === 0 ? (
            <p className="text-sm text-gray-500 italic">No assignments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm bg-white rounded-md">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Member</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Primary Slots</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Primary Load</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Secondary Slots</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Secondary Load</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Total Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(workload)
                    .sort((a, b) => (b[1].primaryLoad + b[1].secondaryLoad) - (a[1].primaryLoad + a[1].secondaryLoad))
                    .map(([member, data]) => {
                      const totalLoad = data.primaryLoad + data.secondaryLoad;
                      const percentage = (totalLoad / maxTotalLoad) * 100;
                      return (
                        <tr key={member} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium text-gray-800">{member}</td>
                          <td className="py-2 px-3 text-center text-gray-600">{data.primarySlots}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                              {data.primaryLoad.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center text-gray-600">{data.secondarySlots}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-semibold">
                              {data.secondaryLoad.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 w-10 text-right">{percentage.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
