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

## Deployment

This application can be deployed to both GitHub Pages and Cloudflare Pages.

### GitHub Pages

The application is configured for automatic deployment to GitHub Pages.

#### Automatic Deployment

When you push to the `main` or `master` branch, GitHub Actions will automatically:
1. Build the application
2. Deploy to GitHub Pages

Make sure to enable GitHub Pages in your repository settings:
- Go to Settings > Pages
- Source: GitHub Actions

#### Manual Deployment

You can also deploy manually using:

```bash
npm run build
npm run deploy
```

This will build the app and push it to the `gh-pages` branch.

#### Live URL

After deployment, your app will be available at:
`https://rishav394.github.io/oncall-roster-manager/`

### Cloudflare Pages

For improved performance and global CDN distribution, you can deploy to Cloudflare Pages.

#### Quick Setup

1. **Connect to Cloudflare Pages**
   - Login to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Go to Workers & Pages > Create application > Pages
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build:cloudflare`
   - Build output directory: `dist`
   - Environment variable: `VITE_DEPLOY_TARGET=cloudflare`

3. **Deploy**
   - Cloudflare automatically deploys on every push to `main`
   - Get a free `.pages.dev` subdomain
   - Optional: Add custom domain

#### Benefits of Cloudflare Pages

- **Global CDN**: 300+ edge locations worldwide
- **Unlimited bandwidth**: No bandwidth limits on free tier
- **Auto SSL**: Automatic HTTPS certificates
- **Fast builds**: Parallel build processing
- **Web Analytics**: Privacy-focused analytics included

For detailed instructions, see [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md)

## License

ISC
