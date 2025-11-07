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

    rosterData.forEach((row) => {
      if (row.isWeekend) {
        if (row.weekend && row.weekend !== '—') {
          if (!workload[row.weekend]) {
            workload[row.weekend] = { slots: 0, load: 0 };
          }
          workload[row.weekend].slots += 1;
          workload[row.weekend].load += 2; // Weekend counts as 2
        }
      } else {
        if (row.morning && row.morning !== '—') {
          if (!workload[row.morning]) {
            workload[row.morning] = { slots: 0, load: 0 };
          }
          workload[row.morning].slots += 1;
          workload[row.morning].load += 1;
        }
        if (row.evening && row.evening !== '—') {
          if (!workload[row.evening]) {
            workload[row.evening] = { slots: 0, load: 0 };
          }
          workload[row.evening].slots += 1;
          workload[row.evening].load += 1;
        }
      }
    });

    return workload;
  };

  const workload = calculateWorkload();
  const maxLoad = Math.max(...Object.values(workload).map(w => w.load), 1);

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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Workload Distribution
          </h3>

          {Object.keys(workload).length === 0 ? (
            <p className="text-sm text-gray-500 italic">No assignments yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(workload)
                .sort((a, b) => b[1].load - a[1].load)
                .map(([member, data]) => {
                  const percentage = (data.load / maxLoad) * 100;
                  return (
                    <div key={member} className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{member}</span>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-600">
                            {data.slots} slot{data.slots !== 1 ? 's' : ''}
                          </span>
                          <span className="font-semibold text-blue-600 bg-white px-2 py-1 rounded shadow-sm">
                            Load: {data.load}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}

              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Note:</span> Weekend slots count as 2 load units (covers full day).
                  Load balancing ensures fair distribution across all team members.
                </p>
              </div>
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
                Morning / Weekend POC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Evening
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700" colSpan="2">
                        <span className={row.weekend === '—' ? 'text-red-500 font-semibold' : 'bg-purple-100 px-3 py-1 rounded-full'}>
                          {row.weekend} {row.weekend !== '—' && <span className="text-xs text-gray-600 ml-2">(Full Day)</span>}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className={row.morning === '—' ? 'text-red-500 font-semibold' : 'bg-blue-100 px-3 py-1 rounded-full'}>
                          {row.morning}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className={row.evening === '—' ? 'text-red-500 font-semibold' : 'bg-green-100 px-3 py-1 rounded-full'}>
                          {row.evening}
                        </span>
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
        <h3 className="font-semibold text-gray-700 mb-2">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Days</p>
            <p className="text-lg font-bold text-gray-800">{rosterData.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Slots</p>
            <p className="text-lg font-bold text-gray-800">
              {rosterData.reduce((total, row) => {
                return total + (row.isWeekend ? 1 : 2);
              }, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unfilled Slots</p>
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
            <p className="text-sm text-gray-600">Coverage</p>
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

        {/* Workload Summary */}
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-md border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Workload Distribution
          </h3>

          {Object.keys(workload).length === 0 ? (
            <p className="text-sm text-gray-500 italic">No assignments yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(workload)
                .sort((a, b) => b[1].load - a[1].load)
                .map(([member, data]) => {
                  const percentage = (data.load / maxLoad) * 100;
                  return (
                    <div key={member} className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{member}</span>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-600">
                            {data.slots} slot{data.slots !== 1 ? 's' : ''}
                          </span>
                          <span className="font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            Load: {data.load}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}

              <div className="mt-4 pt-3 border-t border-blue-200">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Note:</span> Weekend slots count as 2 load units (covers full day).
                  Load balancing ensures fair distribution across all team members.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
