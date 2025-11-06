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
      </div>
      </div>
    </div>
  );
}
