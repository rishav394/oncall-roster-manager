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
 * Generate balanced oncall roster using greedy algorithm
 * @param {Array} members - Array of member names
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {Array} leaves - Array of leave objects
 * @returns {Array} Array of assignments {date, slot, member}
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
  const lastSlotIndex = Object.fromEntries(members.map(m => [m, -Infinity]));

  for (let i = 0; i < slots.length; i++) {
    const { date, slot } = slots[i];

    // Find eligible members (not on leave and has 2-slot gap)
    const eligible = members.filter(m =>
      !isOnLeave(m, date, slot, leaves) &&
      i - lastSlotIndex[m] > 2
    );

    if (eligible.length === 0) {
      // No eligible member found
      assignments.push({ date, slot, member: '—' });
      continue;
    }

    // Sort by load (least assigned first)
    eligible.sort((a, b) => load[a] - load[b]);

    const chosen = eligible[0];
    assignments.push({ date, slot, member: chosen });
    // Weekend slots count as 2 load units (covers full day)
    load[chosen] += (slot === 'Weekend' ? 2 : 1);
    lastSlotIndex[chosen] = i;
  }

  return assignments;
}

/**
 * Convert assignments array to roster table format
 * @param {Array} assignments - Array from generateRoster
 * @returns {Array} Array of {date, morning, evening, weekend, isWeekend} objects
 */
export function formatRosterTable(assignments) {
  const rosterMap = new Map();

  for (const { date, slot, member } of assignments) {
    if (!rosterMap.has(date)) {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      rosterMap.set(date, { date, morning: '', evening: '', weekend: '', isWeekend });
    }
    const row = rosterMap.get(date);
    if (slot === 'Morning') {
      row.morning = member;
    } else if (slot === 'Evening') {
      row.evening = member;
    } else if (slot === 'Weekend') {
      row.weekend = member;
    }
  }

  return Array.from(rosterMap.values());
}
