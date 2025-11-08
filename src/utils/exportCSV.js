import Papa from 'papaparse';

/**
 * Export roster table to CSV file with primary and secondary POCs
 * @param {Array} rosterData - Array of {date, morning, morningSecondary, evening, eveningSecondary, weekend, weekendSecondary, isWeekend} objects
 * @param {string} filename - Filename for the CSV (optional)
 */
export function exportToCSV(rosterData, filename = 'oncall-roster.csv') {
  if (!rosterData || rosterData.length === 0) {
    alert('No roster data to export');
    return;
  }

  // Format data for CSV with proper headers
  const csvData = rosterData.map(row => {
    if (row.isWeekend) {
      return {
        'Date': row.date,
        'Morning Primary': '',
        'Morning Secondary': '',
        'Evening Primary': '',
        'Evening Secondary': '',
        'Weekend Primary': row.weekend || '',
        'Weekend Secondary': row.weekendSecondary || ''
      };
    }
    return {
      'Date': row.date,
      'Morning Primary': row.morning || '',
      'Morning Secondary': row.morningSecondary || '',
      'Evening Primary': row.evening || '',
      'Evening Secondary': row.eveningSecondary || '',
      'Weekend Primary': '',
      'Weekend Secondary': ''
    };
  });

  // Convert to CSV using papaparse
  const csv = Papa.unparse(csvData, {
    header: true,
    columns: ['Date', 'Morning Primary', 'Morning Secondary', 'Evening Primary', 'Evening Secondary', 'Weekend Primary', 'Weekend Secondary']
  });

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
