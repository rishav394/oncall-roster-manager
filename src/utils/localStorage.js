const STORAGE_KEY = 'oncall-roster-data';

/**
 * Save data to localStorage
 * @param {Object} data - Data object to save
 */
export function saveToLocalStorage(data) {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Load data from localStorage
 * @returns {Object|null} Saved data or null if not found
 */
export function loadFromLocalStorage() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

/**
 * Clear data from localStorage
 */
export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
