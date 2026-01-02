# Cloudflare Pages Deployment Guide

This guide explains how to deploy the Oncall Roster Manager to Cloudflare Pages.

## Prerequisites

- A Cloudflare account (free tier works)
- GitHub repository access
- Node.js 20+ installed locally (for testing)

## Deployment Options

### Option 1: Direct Git Integration (Recommended)

This is the easiest method - Cloudflare automatically deploys when you push to your repository.

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Workers & Pages** > **Create application** > **Pages**

2. **Connect to Git**
   - Click **Connect to Git**
   - Authorize Cloudflare to access your GitHub account
   - Install the Cloudflare Pages app to your repository
   - Select the `oncall-roster-manager` repository

3. **Configure Build Settings**
   - **Project name:** `oncall-roster-manager` (or your preferred name)
   - **Production branch:** `main`
   - **Build command:** `npm run build:cloudflare`
   - **Build output directory:** `dist`
   - **Environment variables:**
     - Add `NODE_VERSION` = `20`
     - Add `VITE_DEPLOY_TARGET` = `cloudflare`

4. **Deploy**
   - Click **Save and Deploy**
   - Cloudflare will build and deploy your site
   - You'll get a URL like `oncall-roster-manager.pages.dev`

5. **Future Deployments**
   - Every push to `main` triggers automatic redeployment
   - Preview deployments are created for pull requests

### Option 2: Manual Deployment with Wrangler CLI

For local deployments or CI/CD systems.

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Build the Project**
   ```bash
   npm run build:cloudflare
   ```

4. **Deploy**
   ```bash
   wrangler pages deploy dist --project-name=oncall-roster-manager
   ```

5. **Subsequent Deployments**
   ```bash
   npm run build:cloudflare && wrangler pages deploy dist --project-name=oncall-roster-manager
   ```

## Configuration Files

### `wrangler.toml`
Cloudflare Pages configuration file. Customize as needed:

```toml
name = "oncall-roster-manager"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[build]
command = "npm run build:cloudflare"

[build.environment]
NODE_VERSION = "20"
```

### `vite.config.js`
The Vite config automatically uses the correct base path:
- Cloudflare Pages: `/` (root)
- GitHub Pages: `/oncall-roster-manager/` (subdirectory)

Set `VITE_DEPLOY_TARGET=cloudflare` to use root path.

## Custom Domain

1. **Add Custom Domain in Cloudflare**
   - Go to your Pages project > **Custom domains**
   - Click **Set up a custom domain**
   - Enter your domain (e.g., `oncall.example.com`)

2. **Configure DNS**
   - If your domain is on Cloudflare, DNS is configured automatically
   - If external, add a CNAME record pointing to your Pages URL

3. **SSL Certificate**
   - Cloudflare automatically provisions SSL certificates
   - Your site will be available over HTTPS

## Environment Variables

You can add environment variables in Cloudflare Pages dashboard:

1. Go to **Settings** > **Environment variables**
2. Add variables for **Production** and/or **Preview** environments
3. Redeploy to apply changes

Example variables:
- `NODE_VERSION`: `20`
- `VITE_DEPLOY_TARGET`: `cloudflare`

## Differences from GitHub Pages

| Feature | GitHub Pages | Cloudflare Pages |
|---------|-------------|------------------|
| Base URL | `/oncall-roster-manager/` | `/` |
| Build command | `npm run build` | `npm run build:cloudflare` |
| Deployment | GitHub Actions | Git integration or Actions |
| Custom domain | Requires DNS | Automatic with Cloudflare DNS |
| Edge network | GitHub CDN | Cloudflare CDN (300+ locations) |
| Analytics | GitHub Insights | Cloudflare Web Analytics |
| Functions | Not supported | Serverless Functions available |

## Troubleshooting

### Build Fails
- Check that Node version is set to 20 in environment variables
- Verify `VITE_DEPLOY_TARGET=cloudflare` is set
- Check build logs in Cloudflare dashboard

### Blank Page After Deployment
- Ensure base path is `/` (not `/oncall-roster-manager/`)
- Verify `build:cloudflare` script was used
- Check browser console for 404 errors

### Assets Not Loading
- Clear browser cache
- Check Network tab in DevTools
- Verify assets are in the `dist` folder after build

### Deployment Not Triggering
- Check GitHub webhook settings in Cloudflare
- Verify branch name matches (default: `main`)
- Manually trigger deployment from Cloudflare dashboard

## Performance Benefits

Cloudflare Pages offers several advantages:

1. **Global CDN**: 300+ edge locations worldwide
2. **Instant cache purging**: Updates propagate in seconds
3. **Unlimited bandwidth**: No bandwidth limits on free tier
4. **Fast builds**: Parallel build processing
5. **Built-in analytics**: Web Analytics included (privacy-focused)
6. **DDoS protection**: Automatic protection included
7. **Always HTTPS**: Automatic SSL certificates

## Cost

Cloudflare Pages **Free Tier** includes:
- Unlimited sites
- Unlimited requests
- Unlimited bandwidth
- 500 builds per month
- 1 concurrent build

This is more than sufficient for most use cases.

## Support

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [GitHub Issues](https://github.com/rishav394/oncall-roster-manager/issues)

## Quick Start Commands

```bash
# Build for Cloudflare Pages
npm run build:cloudflare

# Preview locally
npm run preview

# Deploy with Wrangler
wrangler pages deploy dist --project-name=oncall-roster-manager
```

---

**Last Updated:** 2026-01-02
**Status:** Production-ready for Cloudflare Pages deployment
