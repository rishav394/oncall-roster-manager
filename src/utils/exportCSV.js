import Papa from 'papaparse';

/**
 * Export roster table to CSV file
 * @param {Array} rosterData - Array of {date, morning, evening, weekend, isWeekend} objects
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
        'Morning': '',
        'Evening': '',
        'Weekend POC': row.weekend
      };
    }
    return {
      'Date': row.date,
      'Morning': row.morning,
      'Evening': row.evening,
      'Weekend POC': ''
    };
  });

  // Convert to CSV using papaparse
  const csv = Papa.unparse(csvData, {
    header: true,
    columns: ['Date', 'Morning', 'Evening', 'Weekend POC']
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
