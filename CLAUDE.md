# CLAUDE.md - Oncall Roster Scheduler Project Guide

> **Purpose:** This file helps Claude (or any AI assistant) quickly understand the entire project context, architecture, features, and implementation details.

---

## 📋 Project Overview

**Oncall Roster Scheduler** is a frontend-only React application that automatically generates balanced oncall rosters for engineering teams. It uses a greedy balancing algorithm with constraint satisfaction to create fair schedules while respecting team member leaves.

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

**Algorithm Type:** Greedy with constraint satisfaction

**Key Constraints:**
1. **2-Slot Gap Rule:** Each member must have ≥2 slots between consecutive oncalls
2. **Leave Respect:** Members on leave cannot be assigned
3. **Load Balancing:** Distributes assignments evenly (least-loaded member gets next slot)

**Slot Types:**
- **Weekdays (Mon-Fri):** 2 slots per day (Morning, Evening)
- **Weekends (Sat-Sun):** 1 slot per day (Weekend - full day)

**Process Flow:**
```
1. Generate all slots for date range
2. For each slot in order:
   a. Find eligible members (not on leave, has 2-slot gap)
   b. Sort by current load (ascending)
   c. Assign least-loaded member
   d. Update member's load and last-assigned index
3. Return assignments array
4. Format into roster table (grouped by date)
```

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
│   │   ├── Day cells with assignments
│   │   └── Legend
│   └── Table View (if table mode)
│       ├── Date/Morning/Evening columns
│       ├── Weekend highlighting
│       └── Statistics panel
│
└── Documentation Sections
    ├── How it Works (blue)
    ├── Key Features (green)
    ├── Custom Leave Modes (purple)
    └── Pro Tips (amber)
```

### Utility Files

**`src/utils/generateRoster.js`**
- `getSlots()` - Generates slot array from date range
- `isOnLeave()` - Checks if member is on leave for specific date/slot
- `generateRoster()` - Main algorithm
- `formatRosterTable()` - Converts assignments to table format

**`src/utils/exportCSV.js`**
- `exportToCSV()` - Exports roster to CSV using papaparse

**`src/utils/localStorage.js`**
- `saveToLocalStorage()` - Persists config
- `loadFromLocalStorage()` - Restores config
- `clearLocalStorage()` - Clears saved data

**`src/utils/yamlConfig.js`**
- `exportToYAML()` - Downloads config as YAML file
- `importFromYAML()` - Parses and validates YAML upload

---

## 🎨 Features Implementation Details

### 1. Leave Types

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

### 2. Calendar View

**Location:** `src/components/CalendarView.jsx`

**Layout:**
- Traditional calendar grid (7 columns for days of week)
- Weeks as rows
- Empty cells for dates outside range
- Auto-groups days into weeks

**Cell Display:**
- **Weekdays:** Two cards (Morning blue, Evening green)
- **Weekends:** One card (Weekend purple)
- Weekend badge indicator
- Unfilled slots in red

**Grouping Logic:**
```javascript
// Groups assignments by week starting Sunday
// Pads incomplete weeks with null cells
// Ensures 7-column grid alignment
```

### 3. YAML Export/Import

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

### 4. Grouped Leaves Display

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

### 5. Date Range Constraints

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
      morning: "Alice",
      evening: "Bob",
      weekend: "",                     // Empty for weekdays
      isWeekend: false
    },
    {
      date: "2025-11-02",              // Saturday
      morning: "",
      evening: "",
      weekend: "Carol",                // Populated for weekends
      isWeekend: true
    }
  ]
}
```

### Leave Object Variations

```javascript
// All Morning Leave
{ id: 123, type: "allMorning", member: "Alice" }

// All Evening Leave
{ id: 124, type: "allEvening", member: "Bob" }

// Weekend Leave
{ id: 125, type: "weekend", member: "Carol" }

// Complete Leave
{ id: 126, type: "complete", member: "David" }

// Custom Leave
{ id: 127, type: "custom", member: "Alice", date: "2025-11-15", slot: "Both" }
{ id: 128, type: "custom", member: "Bob", date: "2025-11-20", slot: "Morning" }
```

---

## 🔧 Key Technical Decisions

### Why No Backend?
- **Simplicity:** Frontend-only = easy deployment
- **Privacy:** No data leaves user's browser
- **Cost:** No server costs
- **Speed:** Instant computation
- **Portability:** YAML export/import for sharing

### Why Greedy Algorithm?
- **Speed:** O(n*m) where n=slots, m=members
- **Good Enough:** Produces near-optimal results
- **Predictable:** Deterministic output
- **Simple:** Easy to understand and debug

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

## 📝 Recent Major Changes

### Latest Features (Chronological)

1. **Initial Implementation**
   - Core scheduling algorithm
   - Basic UI with team members, date range
   - Simple leave management

2. **All Evening Leave**
   - Added alongside All Morning
   - Grid layout updated to 3 columns

3. **Weekend Single Slot**
   - Changed from 2 slots (M/E) to 1 slot (Weekend)
   - Updated algorithm, UI, CSV export
   - Purple color for weekend slots

4. **Calendar View**
   - Added beautiful calendar grid layout
   - View toggle (Calendar/Table)
   - Week-based organization
   - Set as default view

5. **Default Slot: Both**
   - Changed custom leave default from "Morning" to "Both"

6. **Date Range Constraints**
   - Added min/max to date inputs
   - Smart linking (start affects end max, vice versa)
   - Validation with helpful errors

7. **Grouped Leaves Display**
   - Reorganized leaves by member
   - Color-coded type badges
   - Bulk "Remove All" per member
   - Visual cards with gradients

8. **YAML Export/Import**
   - Added js-yaml dependency
   - Export config as YAML file
   - Import and validate YAML
   - Green/purple buttons in UI

9. **Multi-Date Selection**
   - Added "Multiple Dates" mode
   - Date picker + chips UI
   - Click × to remove dates
   - Perfect for non-consecutive patterns

10. **Comprehensive Documentation**
    - 4 color-coded sections
    - How it Works, Features, Modes, Tips
    - Examples and use cases

---

## 🐛 Known Limitations & Edge Cases

### Algorithm Limitations

**Impossible Scenarios:**
- If constraints are too tight (many leaves + small team), slots may be unfilled
- Shows "—" for unfilled slots (no alternative suggested)

**No Optimization:**
- Greedy algorithm doesn't backtrack
- May not find globally optimal solution
- Trade-off: Speed vs Perfect balance

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

### Data Constraints

**Browser Storage:**
- localStorage limited to ~5-10MB
- Sufficient for typical use cases

**No Validation:**
- Doesn't prevent impossible configurations
- User can add conflicting leaves

---

## 🧪 Testing Scenarios

### Common Test Cases

**Basic Generation:**
```
Members: Alice, Bob, Carol
Dates: 2025-11-01 to 2025-11-07 (1 week)
Leaves: None
Expected: Balanced distribution, no unfilled slots
```

**With Leaves:**
```
Members: Alice, Bob, Carol
Dates: 2025-11-01 to 2025-11-30 (1 month)
Leaves: Alice - Weekend Leave, Bob - Custom (15th, Both)
Expected: No Alice on weekends, No Bob on 15th
```

**Edge Case - Too Many Leaves:**
```
Members: Alice, Bob
Dates: 2025-11-01 to 2025-11-07
Leaves: Alice - Complete, Bob - Weekend
Expected: Some unfilled slots (weekends)
```

**Multi-Date Custom Leave:**
```
Members: Alice, Bob, Carol, David
Dates: 2025-11-01 to 2025-11-30
Leaves: Alice - Multiple Dates (3, 6, 12, 18, 24)
Expected: Alice has 5 days blocked, balanced otherwise
```

---

## 📁 File Reference

### Core Files
- `src/App.jsx` - Main application component (345 lines)
- `src/main.jsx` - Entry point
- `src/index.css` - TailwindCSS imports + base styles

### Components
- `src/components/LeaveSelector.jsx` - Leave management UI (465 lines)
- `src/components/RosterTable.jsx` - Roster display with view toggle (250 lines)
- `src/components/CalendarView.jsx` - Calendar grid view (200 lines)

### Utilities
- `src/utils/generateRoster.js` - Scheduling algorithm (158 lines)
- `src/utils/exportCSV.js` - CSV export using papaparse (42 lines)
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

## 💡 Future Enhancement Ideas (Not Implemented)

These are suggestions for future development:

1. **Workload Visualization** - Bar chart showing assignments per member
2. **Manual Override** - Click to swap/reassign slots
3. **Leave Templates** - Save common patterns (holidays, etc.)
4. **Enhanced Validation** - Warnings before generation
5. **Better Unfilled Handling** - Suggest alternatives when slot can't be filled
6. **Workload Preferences** - Member preferences for weekends/slots
7. **CSV Import** - Bulk import leaves from spreadsheet
8. **Print/PDF Export** - Better formatted output
9. **Roster Versions** - Save/compare multiple versions
10. **Quick Filters** - Filter by member, date, type

---

## 🎓 Learning Resources

### Algorithm Understanding
- Greedy algorithms: Choose locally optimal at each step
- Constraint satisfaction: Must satisfy all rules
- Load balancing: Distribute work evenly

### Tech Stack
- React Hooks: useState, useEffect, useRef
- Vite: Modern build tool
- TailwindCSS v4: Utility-first CSS
- js-yaml: YAML parser
- papaparse: CSV parser

### Patterns Used
- Component composition
- Controlled components (React forms)
- Conditional rendering
- Array methods (map, filter, reduce, sort)
- LocalStorage API
- FileReader API (file uploads)

---

## 🆘 Common Issues & Solutions

### "Dates are not constrained"
**Fix:** Ensure `startDate` and `endDate` props are passed to `LeaveSelector`

### "YAML import fails"
**Fix:** Check YAML structure - must have `teamMembers`, `dateRange` with `start`/`end`

### "Unfilled slots (—)"
**Cause:** Too many leaves or constraints too tight
**Solution:** Reduce leaves or add more members

### "LocalStorage not persisting"
**Cause:** Private/incognito mode or storage full
**Solution:** Use YAML export instead

### "Calendar view looks wrong"
**Cause:** Date grouping issue
**Fix:** Check `groupByWeeks()` logic in CalendarView

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
**Branch Pattern:** claude/read-the-f-* (feature branches)
**Main Branch:** main
**Live URL:** https://rishav394.github.io/oncall-roster-manager/
**Tech Level:** Production-ready
**Status:** ✅ Complete and functional

---

## ✨ Final Notes for Claude

When working on this project:

1. **Always read this file first** to understand context
2. **Check recent commits** to see what changed recently
3. **Run build** before committing to catch errors
4. **Test key scenarios** after changes (basic generation, leaves, export)
5. **Update this file** if you add major features
6. **Follow existing patterns** for consistency
7. **Maintain color scheme** when adding UI elements

The codebase is clean, well-organized, and production-ready. All features work as documented. Have fun enhancing it! 🚀

---

**Last Updated:** 2025-11-07
**Version:** 1.0 (All PRD requirements complete + enhancements)
**Lines of Code:** ~2,000 (excluding node_modules)
