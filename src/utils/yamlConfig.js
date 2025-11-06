import yaml from 'js-yaml';

/**
 * Export configuration to YAML file
 * @param {Object} config - Configuration object
 * @param {Array} config.members - Array of member names
 * @param {string} config.startDate - Start date
 * @param {string} config.endDate - End date
 * @param {Array} config.leaves - Array of leave objects
 * @param {string} filename - Filename for the YAML file
 */
export function exportToYAML(config, filename = 'oncall-config.yaml') {
  try {
    // Format leaves for better readability in YAML
    const formattedLeaves = config.leaves.map(leave => ({
      member: leave.member,
      type: leave.type,
      ...(leave.date && { date: leave.date }),
      ...(leave.slot && { slot: leave.slot })
    }));

    const yamlConfig = {
      teamMembers: config.members,
      dateRange: {
        start: config.startDate,
        end: config.endDate
      },
      leaves: formattedLeaves
    };

    // Convert to YAML
    const yamlStr = yaml.dump(yamlConfig, {
      indent: 2,
      lineWidth: -1,
      noRefs: true
    });

    // Create blob and download
    const blob = new Blob([yamlStr], { type: 'text/yaml;charset=utf-8;' });
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
  } catch (error) {
    console.error('Error exporting to YAML:', error);
    alert('Failed to export configuration to YAML');
  }
}

/**
 * Import configuration from YAML file
 * @param {File} file - YAML file to import
 * @returns {Promise<Object>} Parsed configuration object
 */
export async function importFromYAML(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const yamlContent = e.target.result;
        const config = yaml.load(yamlContent);

        // Validate the configuration
        if (!config.teamMembers || !Array.isArray(config.teamMembers)) {
          throw new Error('Invalid YAML: teamMembers must be an array');
        }

        if (!config.dateRange || !config.dateRange.start || !config.dateRange.end) {
          throw new Error('Invalid YAML: dateRange must have start and end dates');
        }

        // Format leaves with IDs
        const formattedLeaves = (config.leaves || []).map((leave, index) => ({
          id: Date.now() + index,
          member: leave.member,
          type: leave.type,
          ...(leave.date && { date: leave.date }),
          ...(leave.slot && { slot: leave.slot })
        }));

        resolve({
          members: config.teamMembers,
          startDate: config.dateRange.start,
          endDate: config.dateRange.end,
          leaves: formattedLeaves
        });
      } catch (error) {
        console.error('Error parsing YAML:', error);
        reject(new Error('Failed to parse YAML file: ' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
