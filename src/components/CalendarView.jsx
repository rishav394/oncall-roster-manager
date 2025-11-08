export default function CalendarView({ rosterData }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDate();
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getMonthYear = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (!rosterData || rosterData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Calendar View</h2>
        <p className="text-gray-500 italic text-center py-8">
          No roster generated yet. Fill in the details above and click "Generate Roster"
        </p>
      </div>
    );
  }

  // Group roster data by week
  const groupByWeeks = () => {
    const weeks = [];
    let currentWeek = [];

    rosterData.forEach((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push(day);

      // If it's the last day, push the current week
      if (index === rosterData.length - 1) {
        weeks.push(currentWeek);
      }
    });

    return weeks;
  };

  // Pad weeks to always show 7 days
  const padWeek = (week) => {
    if (week.length === 0) return week;

    const firstDay = new Date(week[0].date).getDay();
    const lastDay = new Date(week[week.length - 1].date).getDay();

    // Pad beginning
    const paddedWeek = [...Array(firstDay).fill(null), ...week];

    // Pad end
    while (paddedWeek.length < 7) {
      paddedWeek.push(null);
    }

    return paddedWeek;
  };

  const weeks = groupByWeeks();
  const monthYear = rosterData.length > 0 ? getMonthYear(rosterData[0].date) : '';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Calendar View</h2>
        <p className="text-lg text-gray-600">{monthYear}</p>
      </div>

      <div className="overflow-x-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div
              key={day}
              className={`text-center font-semibold text-sm py-2 ${
                index === 0 || index === 6 ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {padWeek(week).map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`min-h-[120px] border rounded-lg p-2 ${
                    day
                      ? day.isWeekend
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  {day && (
                    <>
                      {/* Date */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-lg font-semibold ${
                          day.isWeekend ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {formatDate(day.date)}
                        </span>
                        {day.isWeekend && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                            WE
                          </span>
                        )}
                      </div>

                      {/* Assignments */}
                      <div className="space-y-1.5">
                        {day.isWeekend ? (
                          // Weekend slot
                          <div className="bg-purple-100 rounded px-2 py-1.5 text-xs">
                            <div className="font-medium text-purple-900 mb-0.5">
                              Full Day
                            </div>
                            <div className={`font-semibold ${
                              day.weekend === '—' ? 'text-red-600' : 'text-purple-700'
                            }`}>
                              {day.weekend} <span className="text-purple-600">(P)</span>
                            </div>
                            {day.weekendSecondary && day.weekendSecondary !== '—' && (
                              <div className="text-purple-600 mt-0.5">
                                {day.weekendSecondary} <span className="text-purple-500">(S)</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Weekday slots
                          <>
                            <div className="bg-blue-100 rounded px-2 py-1.5 text-xs">
                              <div className="font-medium text-blue-900 mb-0.5">
                                Morning
                              </div>
                              <div className={`font-semibold ${
                                day.morning === '—' ? 'text-red-600' : 'text-blue-700'
                              }`}>
                                {day.morning} {day.morning !== '—' && <span className="text-blue-600">(P)</span>}
                              </div>
                              {day.morningSecondary && day.morningSecondary !== '—' && (
                                <div className="text-blue-600 mt-0.5">
                                  {day.morningSecondary} <span className="text-blue-500">(S)</span>
                                </div>
                              )}
                            </div>
                            <div className="bg-green-100 rounded px-2 py-1.5 text-xs">
                              <div className="font-medium text-green-900 mb-0.5">
                                Evening
                              </div>
                              <div className={`font-semibold ${
                                day.evening === '—' ? 'text-red-600' : 'text-green-700'
                              }`}>
                                {day.evening} {day.evening !== '—' && <span className="text-green-600">(P)</span>}
                              </div>
                              {day.eveningSecondary && day.eveningSecondary !== '—' && (
                                <div className="text-green-600 mt-0.5">
                                  {day.eveningSecondary} <span className="text-green-500">(S)</span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <span className="text-sm text-gray-700">Morning Slot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span className="text-sm text-gray-700">Evening Slot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 rounded"></div>
            <span className="text-sm text-gray-700">Weekend (Full Day)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border-2 border-blue-200 rounded"></div>
            <span className="text-sm text-gray-700">Weekend Day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
