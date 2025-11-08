/**
 * Generate slots for all days in the date range
 * On weekends (Sat/Sun), only create 1 'Weekend' slot instead of Morning/Evening
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array} Array of {date, slot, index} objects
 */
function getSlots(startDate, endDate) {
  const slots = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let index = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      // On weekends, only 1 slot for full day coverage
      slots.push({ date: dateStr, slot: 'Weekend', index: index++ });
    } else {
      // Weekdays have Morning and Evening slots
      slots.push({ date: dateStr, slot: 'Morning', index: index++ });
      slots.push({ date: dateStr, slot: 'Evening', index: index++ });
    }
  }

  return slots;
}

/**
 * Check if a member is on leave for a specific date and slot
 * @param {string} member - Member name
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} slot - 'Morning', 'Evening', or 'Weekend'
 * @param {Array} leaves - Array of leave objects
 * @returns {boolean} True if member is on leave
 */
function isOnLeave(member, date, slot, leaves) {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday

  for (const leave of leaves) {
    if (leave.member !== member) continue;

    // Check custom leave (specific date and slot)
    if (leave.type === 'custom' && leave.date === date) {
      // If custom leave is 'Both', it applies to Weekend slot on weekends
      if (leave.slot === 'Both' || leave.slot === slot) {
        return true;
      }
      // On weekends, Morning or Evening custom leaves also block the Weekend slot
      if (slot === 'Weekend' && (leave.slot === 'Morning' || leave.slot === 'Evening')) {
        return true;
      }
    }

    // Check all morning leave (doesn't apply to Weekend slot)
    if (leave.type === 'allMorning' && slot === 'Morning') {
      return true;
    }

    // Check all evening leave (doesn't apply to Weekend slot)
    if (leave.type === 'allEvening' && slot === 'Evening') {
      return true;
    }

    // Check complete leave (entire date range)
    if (leave.type === 'complete') {
      return true;
    }

    // Check weekend leave (Saturday = 6, Sunday = 0)
    if (leave.type === 'weekend' && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate balanced oncall roster with primary and secondary POCs
 * @param {Array} members - Array of member names
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {Array} leaves - Array of leave objects
 * @returns {Array} Array of assignments {date, slot, primary, secondary}
 */
export function generateRoster(members, startDate, endDate, leaves) {
  if (!members || members.length === 0) {
    return [];
  }

  if (!startDate || !endDate) {
    return [];
  }

  const slots = getSlots(startDate, endDate);
  const assignments = [];
  const load = Object.fromEntries(members.map(m => [m, 0]));
  const weekendSlots = Object.fromEntries(members.map(m => [m, 0])); // Track weekend slots separately
  const lastPrimaryIndex = Object.fromEntries(members.map(m => [m, -Infinity]));
  const lastSecondaryIndex = Object.fromEntries(members.map(m => [m, -Infinity]));

  for (let i = 0; i < slots.length; i++) {
    const { date, slot } = slots[i];

    // Helper function to check if member is eligible based on gap constraints
    const isEligibleForPrimary = (m) => {
      if (isOnLeave(m, date, slot, leaves)) return false;

      // Check gap from last primary assignment (need >2 slot gap)
      if (i - lastPrimaryIndex[m] <= 2) return false;

      // Check gap from last secondary assignment (need >2 slot gap)
      if (i - lastSecondaryIndex[m] <= 2) return false;

      return true;
    };

    const isEligibleForSecondary = (m, primaryMember) => {
      if (m === primaryMember) return false; // Cannot be both primary and secondary
      if (isOnLeave(m, date, slot, leaves)) return false;

      // Check gap from last primary assignment (need >2 slot gap)
      if (i - lastPrimaryIndex[m] <= 2) return false;

      // Check gap from last secondary assignment
      // Secondary has constraint: ±1 slots
      if (Math.abs(i - lastSecondaryIndex[m]) <= 1) return false;

      return true;
    };

    // Find eligible members for primary
    const eligiblePrimary = members.filter(isEligibleForPrimary);

    let primary = '—';
    let secondary = '—';

    if (eligiblePrimary.length > 0) {
      // Sort primary candidates
      if (slot === 'Weekend') {
        eligiblePrimary.sort((a, b) => {
          if (weekendSlots[a] !== weekendSlots[b]) {
            return weekendSlots[a] - weekendSlots[b];
          }
          return load[a] - load[b];
        });
      } else {
        eligiblePrimary.sort((a, b) => load[a] - load[b]);
      }

      primary = eligiblePrimary[0];

      // Update primary tracking
      const loadIncrement = slot === 'Weekend' ? 2 : 1;
      load[primary] += loadIncrement;
      if (slot === 'Weekend') {
        weekendSlots[primary]++;
      }
      lastPrimaryIndex[primary] = i;

      // Find eligible members for secondary (excluding primary)
      const eligibleSecondary = members.filter(m => isEligibleForSecondary(m, primary));

      if (eligibleSecondary.length > 0) {
        // Sort secondary candidates
        if (slot === 'Weekend') {
          eligibleSecondary.sort((a, b) => {
            if (weekendSlots[a] !== weekendSlots[b]) {
              return weekendSlots[a] - weekendSlots[b];
            }
            return load[a] - load[b];
          });
        } else {
          eligibleSecondary.sort((a, b) => load[a] - load[b]);
        }

        secondary = eligibleSecondary[0];

        // Update secondary tracking (secondary gets half the load weight)
        const secondaryLoadIncrement = slot === 'Weekend' ? 1 : 0.5;
        load[secondary] += secondaryLoadIncrement;
        if (slot === 'Weekend') {
          weekendSlots[secondary] += 0.5; // Half weight for secondary weekend
        }
        lastSecondaryIndex[secondary] = i;
      }
    }

    assignments.push({ date, slot, primary, secondary });
  }

  return assignments;
}

/**
 * Convert assignments array to roster table format
 * @param {Array} assignments - Array from generateRoster
 * @returns {Array} Array of {date, morning, morningSecondary, evening, eveningSecondary, weekend, weekendSecondary, isWeekend} objects
 */
export function formatRosterTable(assignments) {
  const rosterMap = new Map();

  for (const { date, slot, primary, secondary } of assignments) {
    if (!rosterMap.has(date)) {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      rosterMap.set(date, {
        date,
        morning: '',
        morningSecondary: '',
        evening: '',
        eveningSecondary: '',
        weekend: '',
        weekendSecondary: '',
        isWeekend
      });
    }
    const row = rosterMap.get(date);
    if (slot === 'Morning') {
      row.morning = primary;
      row.morningSecondary = secondary;
    } else if (slot === 'Evening') {
      row.evening = primary;
      row.eveningSecondary = secondary;
    } else if (slot === 'Weekend') {
      row.weekend = primary;
      row.weekendSecondary = secondary;
    }
  }

  return Array.from(rosterMap.values());
}
