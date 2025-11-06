# Oncall Roster Scheduler

A lightweight React-based tool that automatically generates balanced oncall rosters for engineering teams.

## Features

- **Automatic Scheduling**: Generates balanced oncall rosters with 2-slot gap constraint
- **Leave Management**: Support for multiple leave types:
  - All morning leave
  - Complete leave
  - Weekend leave (Sat/Sun)
  - Custom date-specific leave
- **Smart Balancing**: Greedy algorithm ensures fair workload distribution
- **CSV Export**: Download rosters as CSV files
- **Local Persistence**: Automatically saves your configuration
- **Offline Ready**: Works entirely in the browser, no backend required

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd oncall-roster-manager
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Add Team Members**: Enter team member names in the textarea (one per line)
2. **Set Date Range**: Select start and end dates for the roster
3. **Configure Leaves** (optional):
   - Use quick-add buttons for common leave types
   - Add custom leaves for specific dates and slots
4. **Generate Roster**: Click "Generate Roster" to create the schedule
5. **Export**: Download the roster as CSV using the "Download CSV" button

## How It Works

The scheduler uses a greedy balancing algorithm that:
- Ensures at least 2 slots gap between consecutive oncalls for each member
- Respects all declared leaves
- Distributes workload evenly across team members
- Prioritizes members with fewer assignments

### Constraints

- Each day has two slots: Morning and Evening
- Each member must have ≥2 slot gaps between assignments
- Members cannot be assigned during declared leaves

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Papaparse** - CSV export
- **LocalStorage** - Data persistence

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

## License

ISC
