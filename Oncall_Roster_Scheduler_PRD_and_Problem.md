# 🧭 Oncall Roster Scheduler (Frontend-Only)
### Product Requirements Document (PRD) + Problem Description

---

## 🧩 Problem Description

### **Context**
You are the Team Lead of an engineering team with n members. Each day has two oncall slots - **Morning (M)** and **Evening (E)**. You must assign exactly one team member to each slot.

The goal is to generate a **balanced oncall roster** that satisfies:
- At least **2-slot gap** between consecutive oncalls for each member
- Respecting **declared leaves**
- Generating a **greedy-balanced** (near-optimal) schedule

---

### **Constraints**
1. Each member must have at least **2 slots gap** between oncalls.
2. A member cannot be assigned during a declared leave.
3. Each day has two slots: Morning and Evening.
4. Balance workload as evenly as possible among team members.

---

### **Input**
- `n`: Number of team members  
- `d`: Number of days  
- `leaves`: List of tuples `(member, day, slot)`

### **Output**
A 2D table showing assignments for each day and slot:
```
Date        Morning   Evening
2025-11-01  Alice     Bob
2025-11-02  Carol     Alice
```

---

### **Corrected Example**
**Input:**
```
n = 3
d = 3
leaves = [(1, 1, 'M'), (2, 2, 'E')]
```

**Output:**
```
Day 1: M -> 3, E -> 2
Day 2: M -> 1, E -> 3
Day 3: M -> 2, E -> 1
```

Each member has ≥2 slot gaps, no conflicts, and balanced load.

---

## 🧭 Product Requirements Document

### **1. Overview**
A lightweight React-based tool that automatically generates a balanced oncall roster for a date range.  
Inputs: team members, date range, optional leaves.  
Outputs: a balanced, valid roster with CSV export support.

---

### **2. Goals**
| Goal | Description |
|------|--------------|
| Quick roster generation | Create valid rosters instantly |
| Offline & frontend-only | Entirely in-browser, no backend |
| Greedy balancing | Approximate fairness using a simple algorithm |
| Usability | Minimal form and table view |
| Local persistence | Cache previous inputs using localStorage |

---

### **3. User Flow**
1. User enters team members, date range, and leaves.
2. Click “Generate Roster” → table of results.
3. Optionally export roster as CSV.
4. App remembers last inputs automatically.

---

### **4. UI Layout (Wireframe)**
```
 -------------------------------------------------------
| Oncall Roster Scheduler                               |
|-------------------------------------------------------|
| [ Team Members ] [ From: __ ] [ To: __ ]              |
| [ Leave Settings ▼ ]                                  |
|   - All morning leave                                 |
|   - Complete leave                                    |
|   - Weekend leave (Sat/Sun)                           |
|   - + Add Custom Leave                                |
|                                                       |
| [Generate Roster] [Clear All]                         |
|-------------------------------------------------------|
| Roster Table:                                         |
|  Date        | Morning | Evening                      |
|  01-Jan-2025 | Alice   | Bob                          |
|  02-Jan-2025 | Carol   | Alice                        |
|-------------------------------------------------------|
| [Download CSV]                                        |
 -------------------------------------------------------
```

---

### **5. Functional Requirements**

#### **Input Handling**
- Team members entered manually.
- Date pickers for range (inclusive).
- Leave options:
  - All morning leave
  - Complete leave
  - Weekend leave (Sat/Sun)
  - Custom date-slot leave

#### **Output Rules**
- Two slots per day (Morning, Evening)
- Members must have ≥2 slot gaps.
- Greedy balancing:
  - Sort by least assigned member.
  - Skip those violating constraints or on leave.

#### **Data Model**
```js
{
  members: ["Alice", "Bob", "Carol"],
  startDate: "2025-11-01",
  endDate: "2025-11-07",
  leaves: [
    { member: "Alice", date: "2025-11-02", slot: "Morning" },
    { member: "Bob", type: "WeekendLeave" }
  ],
  roster: [
    { date: "2025-11-01", morning: "Bob", evening: "Alice" }
  ]
}
```

---

### **6. Technical Implementation**

#### **Tech Stack**
- React (Vite/CRA)
- TailwindCSS
- CSV export via `json2csv` or `papaparse`
- localStorage persistence

#### **Algorithm (Greedy Balancing)**
```js
function generateRoster(members, startDate, endDate, leaves) {
  const slots = getSlots(startDate, endDate);
  const assignments = [];
  const load = Object.fromEntries(members.map(m => [m, 0]));
  const lastSlotIndex = Object.fromEntries(members.map(m => [m, -Infinity]));

  for (let i = 0; i < slots.length; i++) {
    const { date, slot } = slots[i];
    const eligible = members.filter(m =>
      !isOnLeave(m, date, slot, leaves) &&
      i - lastSlotIndex[m] > 2
    );
    if (!eligible.length) {
      assignments.push({ date, slot, member: "—" });
      continue;
    }
    eligible.sort((a, b) => load[a] - load[b]);
    const chosen = eligible[0];
    assignments.push({ date, slot, member: chosen });
    load[chosen]++;
    lastSlotIndex[chosen] = i;
  }
  return assignments;
}
```

---

### **7. Non-Functional Requirements**
| Category | Requirement |
|-----------|--------------|
| Performance | Handle up to 30 days × 10 members |
| Persistence | Use localStorage |
| Accessibility | Minimal UI, keyboard-friendly |
| Offline Ready | Works without network |
| Export | CSV download support |

---

### **8. Future Enhancements**
- Editable roster table (drag-and-drop)
- Fairness score visualization
- Import/export JSON format

---

### **9. Deliverables**
- `App.jsx` — main container  
- `RosterTable.jsx` — output table  
- `LeaveSelector.jsx` — input panel  
- `generateRoster.js` — logic  
- `exportCSV.js` — CSV helper  
- `localStorage.js` — caching

---

### **10. Success Metrics**
| Metric | Target |
|--------|--------|
| Time to roster | <5 seconds |
| Balance deviation | ≤1 slot |
| User satisfaction | 90%+ success rate |

---
