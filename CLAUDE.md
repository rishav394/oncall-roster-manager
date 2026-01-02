# CLAUDE.md - Oncall Roster Scheduler Project Guide

> **Purpose:** This file helps Claude (or any AI assistant) quickly understand the entire project context, architecture, features, and implementation details.

---

## 📋 Project Overview

**Oncall Roster Scheduler** is a frontend-only React application that automatically generates balanced oncall rosters for engineering teams. It uses a greedy balancing algorithm with constraint satisfaction to create fair schedules with **primary and secondary POCs** while respecting team member leaves.

### Key Characteristics
- **Tech Stack:** React 19.2 + Vite 7.2 + TailwindCSS v4
- **Type:** Single-page application (SPA)
- **Backend:** None - entirely client-side
- **Storage:** Browser localStorage + YAML export/import
- **Deployment:** GitHub Pages

---

## 🎯 Core Functionality

### Scheduling Algorithm
**Location:** `src/utils/generateRoster.js`

**Algorithm Type:** Greedy with constraint satisfaction and **dual POC assignment**

**Key Constraints:**
1. **Primary Gap Rule:** Primary POC must have ≥2 slots between consecutive primary OR secondary assignments
2. **Secondary Gap Rule:** Secondary POC must have ≥1 slot gap before AND after assignment (±1 slot buffer)
3. **Role Separation:** Primary and Secondary cannot be the same person for a slot
4. **Leave Respect:** Members on leave cannot be assigned to any role
5. **Independent Load Balancing:** Primary load and secondary load are balanced separately

**Slot Types:**
- **Weekdays (Mon-Fri):** 2 slots per day (Morning, Evening)
- **Weekends (Sat-Sun):** 1 slot per day (Weekend - full day)

**Load Mapping (Critical for Understanding Balance):**
```
Weekday Slots:
  - Primary POC: 1.0 load unit
  - Secondary POC: 0.5 load unit

Weekend Slots:
  - Primary POC: 2.0 load units (covers full day)
  - Secondary POC: 1.0 load unit
```

**Process Flow:**
```
1. Generate all slots for date range (getSlots)
2. For each slot in order:
   PRIMARY ASSIGNMENT:
   a. Find eligible members for primary (not on leave, 2-slot gap from both primary AND secondary)
   b. Sort by PRIMARY load only (ignores secondary load)
   c. For weekends: prioritize members with fewer primary weekend slots
   d. Assign member with lowest primary load
   e. Update primaryLoad and lastPrimaryIndex

   SECONDARY ASSIGNMENT:
   f. Find eligible members for secondary (not on leave, not primary, 1-slot gap from both roles)
   g. Sort by SECONDARY load only (ignores primary load)
   h. For weekends: prioritize members with fewer secondary weekend slots
   i. Assign member with lowest secondary load
   j. Update secondaryLoad and lastSecondaryIndex

3. Return assignments array with {date, slot, primary, secondary}
4. Format into roster table (grouped by date)
```

**Why Independent Load Tracking Matters:**
- If we tracked total load (primary + secondary combined), someone with low primary but high secondary wouldn't get primary slots
- By tracking separately, we ensure BOTH primary and secondary roles are distributed fairly
- Example: Alice has 5 primary slots and 0 secondary → still eligible for secondary
- Example: Bob has 0 primary slots and 5 secondary → still eligible for primary

---

## 🏗️ Architecture

### Component Structure

```
App.jsx (Main Container)
├── Configuration Section
│   ├── Team Members (textarea - one per line)
│   ├── Date Range (start/end date pickers)
│   └── Action Buttons
│       ├── Generate Roster (blue)
│       ├── Clear All (red)
│       ├── Export Config YAML (green)
│       └── Import Config YAML (purple)
│
├── LeaveSelector.jsx
│   ├── Quick Leave Buttons (All Morning, All Evening, Weekend, Complete)
│   ├── Custom Leave Form
│   │   ├── Date Selection Mode Dropdown (Single/Range/Multiple)
│   │   ├── Member Selection
│   │   ├── Date Input(s) - varies by mode
│   │   └── Slot Selection (Morning/Evening/Both)
│   └── Active Leaves Display (Grouped by Member)
│
├── RosterTable.jsx
│   ├── View Toggle (Calendar/Table)
│   ├── Export CSV Button
│   ├── CalendarView.jsx (if calendar mode)
│   │   ├── Week-based grid layout
│   │   ├── Day cells with PRIMARY (P) and SECONDARY (S) POCs
│   │   └── Legend
│   ├── Table View (if table mode)
│   │   ├── Date/Morning/Evening columns with Primary & Secondary
│   │   ├── Weekend highlighting
│   │   ├── Statistics panel (Primary & Secondary coverage)
│   │   └── Workload Distribution Table (6 columns)
│   └── Workload Distribution
│       ├── Member
│       ├── Primary Slots
│       ├── Primary Load (blue badge)
│       ├── Secondary Slots
│       ├── Secondary Load (purple badge)
│       └── Total Distribution (bar chart)
│
└── Documentation Sections
    ├── How it Works (blue) - includes load mapping
    ├── Key Features (green)
    ├── Custom Leave Modes (purple)
    └── Pro Tips (amber)
```

### Utility Files

**`src/utils/generateRoster.js`**
- `getSlots()` - Generates slot array from date range
- `isOnLeave()` - Checks if member is on leave for specific date/slot
- `generateRoster()` - Main algorithm with PRIMARY and SECONDARY POC assignment
- `formatRosterTable()` - Converts assignments to table format with primary/secondary fields

**Key Variables in generateRoster:**
```javascript
const primaryLoad = {}          // Tracks load from primary assignments
const secondaryLoad = {}        // Tracks load from secondary assignments
const primaryWeekendSlots = {}  // Counts primary weekend assignments
const secondaryWeekendSlots = {} // Counts secondary weekend assignments
const lastPrimaryIndex = {}     // Last index where member was primary
const lastSecondaryIndex = {}   // Last index where member was secondary
```

**`src/utils/exportCSV.js`**
- `exportToCSV()` - Exports roster to CSV with 6 columns:
  - Morning Primary, Morning Secondary
  - Evening Primary, Evening Secondary
  - Weekend Primary, Weekend Secondary

**`src/utils/localStorage.js`**
- `saveToLocalStorage()` - Persists config
- `loadFromLocalStorage()` - Restores config
- `clearLocalStorage()` - Clears saved data

**`src/utils/yamlConfig.js`**
- `exportToYAML()` - Downloads config as YAML file
- `importFromYAML()` - Parses and validates YAML upload

---

## 🎨 Features Implementation Details

### 1. Primary & Secondary POC System

**Every slot has TWO POCs:**
- **Primary POC** - Main responsible person (higher load weight)
- **Secondary POC** - Backup person (lower load weight)

**Gap Constraints:**
- **Primary:** If assigned primary at slot i, cannot be primary OR secondary at slots i+1, i+2
- **Secondary:** If assigned secondary at slot i, cannot be primary OR secondary at slots i-1, i+1

**Load Contribution:**
- Primary weekday = 1.0, Primary weekend = 2.0
- Secondary weekday = 0.5, Secondary weekend = 1.0

**UI Representation:**
- Primary shown in darker badge with "(P)" label
- Secondary shown in lighter badge with "(S)" label
- Calendar view: stacked vertically in each slot card
- Table view: two rows per slot (primary top, secondary bottom)

### 2. Leave Types

**All Morning Leave** (`type: 'allMorning'`)
- Blocks ALL morning slots in date range
- Does NOT affect evening or weekend slots

**All Evening Leave** (`type: 'allEvening'`)
- Blocks ALL evening slots in date range
- Does NOT affect morning or weekend slots

**Weekend Leave** (`type: 'weekend'`)
- Blocks weekend slots (Sat/Sun)
- Does NOT affect weekday slots

**Complete Leave** (`type: 'complete'`)
- Blocks ALL slots in entire date range
- Highest priority - blocks everything

**Custom Leave** (`type: 'custom'`)
- Three date selection modes:

**Mode 1: Single Date**
- User picks one specific date
- Select slot: Morning/Evening/Both

**Mode 2: Date Range**
- User picks start and end dates
- Creates leave for EVERY date in range
- Select slot applies to all dates

**Mode 3: Multiple Dates**
- User picks individual non-consecutive dates
- Date picker + chips UI
- Can add/remove dates individually
- Great for patterns like: 3rd, 6th, 12th, 20th
- Select slot applies to all dates

### 3. Calendar View

**Location:** `src/components/CalendarView.jsx`

**Layout:**
- Traditional calendar grid (7 columns for days of week)
- Weeks as rows
- Empty cells for dates outside range
- Auto-groups days into weeks

**Cell Display:**
- **Weekdays:** Two cards (Morning blue, Evening green)
  - Each card shows: Primary (P) and Secondary (S)
- **Weekends:** One card (Weekend purple)
  - Shows: Primary (P) and Secondary (S)
- Weekend badge indicator
- Unfilled slots in red

### 4. Workload Distribution Table

**Location:** Appears in both Calendar and Table views

**6-Column Layout:**
1. **Member** - Team member name
2. **Primary Slots** - Count of primary assignments
3. **Primary Load** - Weighted load from primary (blue badge, 1 decimal)
4. **Secondary Slots** - Count of secondary assignments
5. **Secondary Load** - Weighted load from secondary (purple badge, 1 decimal)
6. **Total Distribution** - Visual bar chart + percentage

**Sorting:** By total load (primaryLoad + secondaryLoad), descending

**Key Info Display:**
- Header shows: "Load: Primary Weekday=1.0, Primary Weekend=2.0, Secondary Weekday=0.5, Secondary Weekend=1.0"
- Makes load calculation transparent
- Easy to verify fairness

**Calculation in RosterTable.jsx:**
```javascript
const calculateWorkload = () => {
  // Tracks primarySlots, secondarySlots, primaryLoad, secondaryLoad separately
  // Weekend primary adds: 1 slot, 2.0 load
  // Weekend secondary adds: 1 slot, 1.0 load
  // Weekday primary adds: 1 slot, 1.0 load
  // Weekday secondary adds: 1 slot, 0.5 load
}
```

### 5. Statistics Panel

**Primary POC Statistics:**
- Total Days
- Primary Slots (total count)
- Unfilled Primary (count of "—")
- Primary Coverage (%)

**Secondary POC Statistics:**
- Secondary Filled (count of assigned secondary slots)
- Secondary Coverage (%)

**Shows independent metrics for each role**

### 6. YAML Export/Import

**YAML Structure:**
```yaml
teamMembers:
  - Alice
  - Bob
  - Carol
dateRange:
  start: 2025-11-01
  end: 2025-11-30
leaves:
  - member: Alice
    type: custom
    date: 2025-11-15
    slot: Both
  - member: Bob
    type: weekend
```

**Export Process:**
1. Collect current state (members, dates, leaves)
2. Format into YAML structure
3. Convert to YAML string using js-yaml
4. Create blob and trigger download

**Import Process:**
1. User selects .yaml/.yml file
2. Parse with js-yaml
3. Validate structure (required fields)
4. Update all state
5. Clear roster (requires regeneration)

### 7. Grouped Leaves Display

**Location:** `src/components/LeaveSelector.jsx` (lines 416-465)

**Organization:**
```
Alice (2 leaves)                    [Remove All]
  [Custom] 2025-11-15 (Both)       [Remove]
  [Weekend] Weekend Leave          [Remove]

Bob (1 leave)                       [Remove All]
  [All Morning] All Mornings       [Remove]
```

**Features:**
- Grouped by member name
- Badge showing leave count
- Bulk "Remove All" per member
- Individual remove buttons
- Color-coded type badges

### 8. Date Range Constraints

**Implementation:** `src/components/LeaveSelector.jsx`

All custom leave date inputs have:
- `min={startDate}` - Cannot select before roster starts
- `max={endDate}` - Cannot select after roster ends

**Date Range Mode:**
- Start date max = selected end date (or roster end)
- End date min = selected start date (or roster start)
- Dynamically linked for smart selection

**Validation:**
- Client-side (HTML5 date constraints)
- JavaScript validation with clear error messages
- Shows date range in error: "Must be within (2025-11-01 to 2025-11-30)"

---

## 🎨 UI/UX Design Patterns

### Color Scheme

**Slot Types:**
- 🔵 Blue (`bg-blue-100`) - Morning slots
- 🟢 Green (`bg-green-100`) - Evening slots
- 🟣 Purple (`bg-purple-100`) - Weekend slots

**Primary vs Secondary:**
- **Primary:** Darker badge (e.g., `bg-blue-100`)
- **Secondary:** Lighter badge (e.g., `bg-blue-50`)

**Leave Type Badges:**
- 🟣 Purple - Custom
- 🔵 Blue - All Morning
- 🟢 Green - All Evening
- 🟦 Indigo - Weekend
- 🔴 Red - Complete

**Action Buttons:**
- 🔵 Blue - Primary actions (Generate)
- 🔴 Red - Destructive actions (Clear, Remove)
- 🟢 Green - Export actions
- 🟣 Purple - Import actions
- ⚫ Gray - Secondary actions

**Documentation Sections:**
- 🔵 Blue - How it Works
- 🟢 Green - Key Features
- 🟣 Purple - Custom Leave Modes
- 🟡 Amber - Pro Tips

### Responsive Design

**Breakpoints:** TailwindCSS defaults
- `sm:` 640px
- `md:` 768px (primary breakpoint used)
- `lg:` 1024px

**Patterns:**
- Mobile: Single column, stacked
- Desktop: Grid layouts (2-3 columns)
- Calendar: Always 7 columns (responsive cell size)

---

## 📊 Data Models

### State Structure (App.jsx)

```javascript
{
  membersInput: "Alice\nBob\nCarol",  // Raw textarea value
  members: ["Alice", "Bob", "Carol"], // Parsed array
  startDate: "2025-11-01",            // YYYY-MM-DD
  endDate: "2025-11-30",              // YYYY-MM-DD
  leaves: [                            // Array of leave objects
    {
      id: 1730123456789,               // Unique timestamp-based ID
      type: "custom",                  // Leave type
      member: "Alice",                 // Member name
      date: "2025-11-15",              // Specific date (for custom)
      slot: "Both"                     // Morning/Evening/Both
    },
    {
      id: 1730123456790,
      type: "weekend",
      member: "Bob"
      // No date/slot for non-custom types
    }
  ],
  rosterData: [                        // Generated roster (formatted)
    {
      date: "2025-11-01",
      morning: "Alice",                // Primary POC
      morningSecondary: "Bob",         // Secondary POC
      evening: "Carol",                // Primary POC
      eveningSecondary: "Alice",       // Secondary POC
      weekend: "",                     // Empty for weekdays
      weekendSecondary: "",
      isWeekend: false
    },
    {
      date: "2025-11-02",              // Saturday
      morning: "",
      morningSecondary: "",
      evening: "",
      eveningSecondary: "",
      weekend: "Carol",                // Primary POC
      weekendSecondary: "Bob",         // Secondary POC
      isWeekend: true
    }
  ]
}
```

### Assignment Object (from generateRoster)

```javascript
{
  date: "2025-11-01",
  slot: "Morning",       // or "Evening" or "Weekend"
  primary: "Alice",      // Primary POC name or "—"
  secondary: "Bob"       // Secondary POC name or "—"
}
```

### Formatted Roster Row

```javascript
{
  date: "2025-11-01",
  morning: "Alice",              // Primary
  morningSecondary: "Bob",       // Secondary
  evening: "Carol",              // Primary
  eveningSecondary: "Alice",     // Secondary
  weekend: "",                   // Primary (empty for weekdays)
  weekendSecondary: "",          // Secondary (empty for weekdays)
  isWeekend: false
}
```

### Workload Object (calculateWorkload result)

```javascript
{
  "Alice": {
    primarySlots: 5,          // Count of primary assignments
    secondarySlots: 3,        // Count of secondary assignments
    primaryLoad: 6.0,         // Weighted load from primary
    secondaryLoad: 2.0        // Weighted load from secondary
  },
  "Bob": {
    primarySlots: 4,
    secondarySlots: 4,
    primaryLoad: 5.0,
    secondaryLoad: 2.5
  }
}
```

---

## 🔧 Key Technical Decisions

### Why Primary & Secondary POCs?

**Problem:** Single POC has no backup if they're unavailable
**Solution:** Dual POC system ensures coverage redundancy

**Implementation Choice:**
- Independent load tracking (not combined)
- Different gap constraints (primary stricter)
- Different load weights (secondary counts less)

**Why this works:**
- Fair distribution of BOTH roles
- Members with high primary still get secondary assignments
- Members with high secondary still get primary assignments
- Better overall team coverage

### Why Independent Load Balancing?

**Old approach:** Track total load (primary + secondary)
**Problem:** Someone with low primary but high secondary won't get primary slots
**New approach:** Separate primaryLoad and secondaryLoad trackers

**Example:**
```
Alice: 0 primary, 10 secondary (total = 10)
Bob:   5 primary, 0 secondary (total = 5)

Old algorithm for next primary slot:
  - Bob has lower total load → Bob gets it
  - Alice NEVER gets primary (unfair!)

New algorithm for next primary slot:
  - Alice has lower PRIMARY load (0 vs 5) → Alice gets it
  - Fair distribution of both roles!
```

### Why Different Gap Constraints?

**Primary:** 2-slot gap (stricter)
- Main responsibility, needs more rest
- Prevents burnout

**Secondary:** 1-slot gap (relaxed)
- Backup role, less demanding
- Easier to fill slots

### Why These Load Weights?

```
Primary Weekday: 1.0  (baseline)
Primary Weekend: 2.0  (2x because full day coverage)
Secondary Weekday: 0.5  (half of primary)
Secondary Weekend: 1.0  (half of primary weekend)
```

**Reasoning:**
- Weekends are 2x load (morning + evening combined)
- Secondary is half load (backup role, less responsibility)
- Maintains proper weight ratios

### Why No Backend?
- **Simplicity:** Frontend-only = easy deployment
- **Privacy:** No data leaves user's browser
- **Cost:** No server costs
- **Speed:** Instant computation
- **Portability:** YAML export/import for sharing

### Why Greedy Algorithm?
- **Speed:** O(n*m) where n=slots, m=members - runs in milliseconds
- **Good Enough:** Produces near-optimal results
- **Predictable:** Deterministic output
- **Simple:** Easy to understand and debug

**Potential Improvements:**
- Prioritize hard-to-fill slots first (heuristic #1)
- Look-ahead to prevent future problems (heuristic #2)
- Multi-pass with randomization (heuristic #3)
- Post-processing swaps (heuristic #4)
- See conversation about algorithm improvements for details

### Why LocalStorage + YAML?
- **Auto-save:** localStorage for convenience
- **Portability:** YAML for sharing/backup
- **Human-readable:** Easy to edit YAML manually
- **Version control:** YAML files can be git-tracked

### Why TailwindCSS v4?
- **Modern:** Latest version with improvements
- **Fast:** PostCSS plugin approach
- **Utility-first:** Rapid development
- **Responsive:** Built-in breakpoints

### Why Vite?
- **Fast:** Lightning-fast HMR
- **Modern:** ES modules native
- **Simple:** Minimal config
- **React 19:** Full support

---

## 🚀 Build & Deployment

### Development
```bash
npm install
npm run dev
# Opens on http://localhost:5173
```

### Build
```bash
npm run build
# Output: dist/
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to GitHub Pages

**Automatic (via GitHub Actions):**
1. Push to `main` branch
2. GitHub Actions workflow runs (`.github/workflows/deploy.yml`)
3. Builds app
4. Deploys to `gh-pages` branch
5. Live at: `https://rishav394.github.io/oncall-roster-manager/`

**Manual:**
```bash
npm run build
npm run deploy
```

**Configuration:**
- `vite.config.js`: `base: '/oncall-roster-manager/'`
- GitHub Settings > Pages > Source: GitHub Actions

---

## 📝 Recent Major Changes (Chronological)

### Phase 1: Initial Implementation
1. Core scheduling algorithm with single POC
2. Basic UI with team members, date range
3. Simple leave management
4. All Evening Leave
5. Weekend single slot (changed from 2 to 1)

### Phase 2: Enhanced Features
6. Calendar View (set as default)
7. Default slot: Both
8. Date range constraints
9. Grouped leaves display
10. YAML export/import
11. Multi-date selection
12. Comprehensive documentation

### Phase 3: Workload & Balance
13. Weekend load counting (1 slot = 2 load units)
14. Workload distribution visualization
15. Compact workload table
16. Weekend assignment optimization

### Phase 4: Primary & Secondary POCs (MAJOR UPDATE)
17. **Dual POC system** - Every slot gets primary AND secondary
18. **Gap constraints** - Primary (2 slots), Secondary (1 slot)
19. **Independent load balancing** - Separate tracking for fair distribution
20. **UI updates** - (P) and (S) labels everywhere
21. **Workload table** - 6 columns showing separated loads
22. **Load mapping documentation** - Clear explanation of weights
23. **Statistics split** - Primary and secondary coverage metrics
24. **CSV export update** - 6 columns for both roles

---

## 🐛 Known Limitations & Edge Cases

### Algorithm Limitations

**Impossible Scenarios:**
- If constraints are too tight (many leaves + small team), slots may be unfilled
- Shows "—" for unfilled slots (no alternative suggested)
- With only 2-3 members, may struggle to fill both primary AND secondary

**No Optimization:**
- Greedy algorithm doesn't backtrack
- May not find globally optimal solution
- Could be improved with heuristics (see algorithm discussion)

**Secondary Gap Strictness:**
- ±1 slot gap for secondary might be too strict for very small teams
- Can be relaxed if needed

### UI/UX Considerations

**No Undo:**
- Once generated, previous roster is lost
- Workaround: Export before regenerating

**No Manual Edits:**
- Can't click to swap assignments
- Must regenerate entire roster

**Large Rosters:**
- Calendar view can get long (>2 months)
- No pagination or month selector
- Workload table scales well but many rows with large teams

### Data Constraints

**Browser Storage:**
- localStorage limited to ~5-10MB
- Sufficient for typical use cases

**No Validation:**
- Doesn't prevent impossible configurations
- User can add conflicting leaves

---

## 🧪 Testing Scenarios

### Basic Generation
```
Members: Alice, Bob, Carol, David
Dates: 2025-11-01 to 2025-11-07 (1 week)
Leaves: None
Expected:
  - All slots filled (both primary and secondary)
  - Balanced distribution
  - No gap violations
```

### With Leaves
```
Members: Alice, Bob, Carol, David
Dates: 2025-11-01 to 2025-11-30 (1 month)
Leaves: Alice - Weekend Leave, Bob - Custom (15th, Both)
Expected:
  - No Alice on weekends (neither primary nor secondary)
  - No Bob on 15th (neither primary nor secondary)
  - Others balanced
```

### Edge Case - Small Team
```
Members: Alice, Bob
Dates: 2025-11-01 to 2025-11-07
Leaves: None
Expected:
  - Primary filled for all
  - Secondary may have gaps (only 2 members, strict constraints)
  - This is acceptable behavior
```

### Load Balancing Verification
```
Members: Alice, Bob, Carol, David (4 members)
Dates: 2025-11-01 to 2025-11-30 (1 month)
Leaves: None
Expected:
  - Primary load within ±1.0 for all members
  - Secondary load within ±0.5 for all members
  - Primary weekend slots differ by at most 1
  - Secondary weekend slots differ by at most 1
```

---

## 📁 File Reference

### Core Files
- `src/App.jsx` - Main application component (updated with load mapping docs)
- `src/main.jsx` - Entry point
- `src/index.css` - TailwindCSS imports + base styles

### Components
- `src/components/LeaveSelector.jsx` - Leave management UI (465 lines)
- `src/components/RosterTable.jsx` - Roster display with PRIMARY/SECONDARY, workload table (500+ lines)
- `src/components/CalendarView.jsx` - Calendar grid view with PRIMARY/SECONDARY (200+ lines)

### Utilities
- `src/utils/generateRoster.js` - Scheduling algorithm with dual POC logic (210 lines)
- `src/utils/exportCSV.js` - CSV export with 6 columns (60 lines)
- `src/utils/localStorage.js` - Browser storage (42 lines)
- `src/utils/yamlConfig.js` - YAML import/export (108 lines)

### Configuration
- `vite.config.js` - Vite config with base path
- `tailwind.config.js` - TailwindCSS v4 config
- `postcss.config.js` - PostCSS with TailwindCSS plugin
- `package.json` - Dependencies and scripts
- `.github/workflows/deploy.yml` - GitHub Actions deployment

### Documentation
- `README.md` - Project overview and setup
- `CLAUDE.md` - This file (comprehensive guide)
- `Oncall_Roster_Scheduler_PRD_and_Problem.md` - Original requirements

---

## 💡 Algorithm Improvement Ideas (Not Implemented)

### Simple Heuristics (Can Improve Current Algorithm)

1. **Prioritize Hard-to-Fill Slots**
   - Sort slots by number of eligible members
   - Fill hardest slots first
   - Reduces unfilled slots by 20-30%
   - Minimal code change

2. **Look-Ahead (Regret Minimization)**
   - Before assigning, check impact on next 2-3 slots
   - Avoid choices that cause future problems
   - 2x slower but smarter

3. **Multi-Pass with Randomization**
   - Run greedy 5 times with slight variations
   - Pick best result
   - 10-15% better balance
   - 5x slower (still fast overall)

4. **Post-Processing Swaps**
   - After greedy, try local swaps to improve
   - Reduces load variance by 5-10%
   - 2x slower

5. **Smart Weekend Distribution**
   - Reserve members without weekends for weekend duty
   - Better weekend balance

### Advanced Algorithms (Significant Rewrite)

1. **Constraint Satisfaction Problem (CSP)**
   - Backtracking with forward checking
   - Finds solution if one exists
   - Much slower, complex

2. **Integer Linear Programming (ILP)**
   - Optimal solution guaranteed
   - Requires external solver (Google OR-Tools)
   - 1-10 seconds generation time
   - Best for complex constraints

3. **Simulated Annealing / Genetic Algorithms**
   - Better than greedy, not optimal
   - Non-deterministic
   - Good for multi-objective

See conversation history for detailed discussion of algorithm improvements.

---

## 🆘 Common Issues & Solutions

### "Primary and secondary loads not balanced"
**Cause:** Algorithm not tracking loads separately
**Fix:** Verified - uses separate `primaryLoad` and `secondaryLoad` trackers

### "Too many unfilled slots"
**Cause:** Constraints too tight (small team, many leaves, strict gaps)
**Solution:**
- Add more team members
- Reduce leave periods
- Consider relaxing secondary gap from 1 to 0 (allow consecutive secondary)

### "Table view breaking - maxLoad undefined"
**Cause:** Old code referencing removed variable
**Fix:** Applied - both calendar and table view use 6-column layout

### "YAML import fails"
**Fix:** Check YAML structure - must have `teamMembers`, `dateRange` with `start`/`end`

### "LocalStorage not persisting"
**Cause:** Private/incognito mode or storage full
**Solution:** Use YAML export instead

### "Build fails"
**Cause:** Usually TailwindCSS v4 PostCSS config
**Fix:** Ensure `@tailwindcss/postcss` is installed

---

## 🎯 Quick Reference Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to gh-pages (manual)
npm run deploy

# Check git status
git status

# Commit changes
git add -A
git commit -m "Your message"

# Push to remote
git push -u origin <branch-name>
```

---

## 📞 Project Context

**Repository:** rishav394/oncall-roster-manager
**Branch Pattern:** claude/* (feature branches)
**Main Branch:** main
**Live URL:** https://rishav394.github.io/oncall-roster-manager/
**Tech Level:** Production-ready
**Status:** ✅ Complete and functional with dual POC system

---

## ✨ Final Notes for Claude

When working on this project:

1. **Always read this file first** to understand context
2. **Primary & Secondary system is core** - don't break the dual POC logic
3. **Independent load tracking is critical** - never combine primaryLoad and secondaryLoad
4. **Gap constraints differ** - Primary (2), Secondary (1) - don't mix them up
5. **Load weights matter** - Weekend = 2x weekday for primary, 1x for secondary
6. **Test both views** - Calendar and Table both show workload distribution
7. **Run build** before committing to catch errors
8. **Update this file** if you add major features
9. **Follow existing patterns** for consistency
10. **Maintain color scheme** when adding UI elements

### Understanding the Algorithm Flow

```
Step 1: PRIMARY ASSIGNMENT
  ↓
  Check: isEligibleForPrimary (leave, gap from BOTH roles)
  ↓
  Sort by: primaryLoad (ignore secondaryLoad)
  ↓
  Pick: Lowest primaryLoad
  ↓
  Update: primaryLoad, primaryWeekendSlots, lastPrimaryIndex

Step 2: SECONDARY ASSIGNMENT
  ↓
  Check: isEligibleForSecondary (leave, not primary, gap from BOTH roles)
  ↓
  Sort by: secondaryLoad (ignore primaryLoad)
  ↓
  Pick: Lowest secondaryLoad
  ↓
  Update: secondaryLoad, secondaryWeekendSlots, lastSecondaryIndex
```

### Key Principle
**NEVER mix primary and secondary load when sorting!**
This ensures fair distribution of BOTH roles.

---

**Last Updated:** 2026-01-02
**Version:** 2.0 (Primary & Secondary POC system complete)
**Lines of Code:** ~2,500 (excluding node_modules)
**Major Features:** Dual POC, Independent load balancing, 6-column workload visualization
