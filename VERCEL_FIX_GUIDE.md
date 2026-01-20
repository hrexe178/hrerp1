# Vercel 404 Fix Guide

## 🔍 Problem Identified

Your Vercel deployment was returning 404 because:
1. **Wrong Configuration**: `vercel.json` was configured to deploy the backend only
2. **Missing Frontend Build**: Vercel wasn't building or serving the React frontend
3. **No SPA Rewrites**: Client-side routing wasn't configured

## ✅ Solution Applied

### 1. Updated `vercel.json`
Changed from backend-only deployment to frontend-only deployment:
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/build`
- **SPA Rewrites**: All routes now redirect to `index.html` for client-side routing

### 2. Updated `.vercelignore`
- Excluded backend files from deployment
- Removed `frontend/build` from ignore list (it was preventing deployment)

### 3. Created `.env.production`
- Added production environment variables for frontend
- **ACTION REQUIRED**: Update `REACT_APP_API_URL` with your backend URL

## 📋 Deployment Steps

### Step 1: Configure Environment Variables in Vercel

Go to your Vercel project settings and add:
```
REACT_APP_API_URL=https://your-backend-api-url.com
REACT_APP_NAME=HR ERP System
REACT_APP_ENV=production
```

**Important**: Replace `https://your-backend-api-url.com` with your actual backend API URL.

### Step 2: Deploy to Vercel

#### Option A: Via Git (Recommended)
```bash
git add .
git commit -m "Fix: Configure Vercel for frontend deployment"
git push origin main
```
Vercel will auto-deploy on push.

#### Option B: Via Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### Step 3: Verify Deployment

After deployment completes:
1. Visit `https://erp-vnzt.vercel.app`
2. You should see the login page (not a 404)
3. Test navigation and routing

## 🏗️ Project Structure After Fix

```
hr-erp-system/
├── frontend/                    # React app (deployed to Vercel)
│   ├── public/
│   │   └── index.html          ✅ Entry point
│   ├── src/
│   │   ├── App.jsx             ✅ Main component with routing
│   │   ├── index.js            ✅ React entry
│   │   └── config/api.js       ✅ API configuration
│   ├── package.json            ✅ Build scripts
│   └── .env.production         ✅ Production env vars
├── backend/                     # Express API (NOT deployed to this Vercel project)
├── vercel.json                  ✅ Frontend deployment config
└── .vercelignore               ✅ Excludes backend
```

## 🔧 Vercel Settings

### Build & Development Settings
- **Framework Preset**: Create React App
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/build`
- **Install Command**: (leave default)
- **Development Command**: (leave default)

### Root Directory
- **Root Directory**: `.` (project root, NOT `frontend`)

## 🌐 Backend Deployment Options

Since this Vercel project now only deploys the frontend, you need to deploy your backend separately:

### Option 1: Separate Vercel Project for Backend
1. Create a new Vercel project for backend
2. Configure `vercel.json` for backend only:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/server.js"
    }
  ]
}
```

### Option 2: Deploy Backend to Railway/Render/Heroku
- Deploy backend to a different platform
- Update `REACT_APP_API_URL` in Vercel environment variables

### Option 3: Monorepo Deployment (Advanced)
Keep both in one Vercel project with multiple deployments using Vercel's monorepo support.

## 🧪 Test Locally Before Deploying

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Test the build locally (install serve if needed)
npx serve -s build -l 3000
```

Visit `http://localhost:3000` - this is what Vercel will serve.

## ⚠️ Common Issues & Fixes

### Issue 1: Still Getting 404
**Cause**: Vercel cache
**Fix**: 
1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment → "Redeploy"
3. Check "Clear Build Cache"

### Issue 2: API Calls Failing
**Cause**: `REACT_APP_API_URL` not set correctly
**Fix**: 
1. Verify environment variable in Vercel dashboard
2. Redeploy after updating

### Issue 3: Blank Page
**Cause**: Build errors or missing dependencies
**Fix**: 
1. Check Vercel build logs
2. Test build locally: `cd frontend && npm run build`

### Issue 4: Routes Return 404 on Refresh
**Cause**: Missing SPA rewrites
**Fix**: Already fixed in `vercel.json` - all routes rewrite to `/index.html`

## 📝 Files Modified

1. ✅ `vercel.json` - Reconfigured for frontend deployment
2. ✅ `.vercelignore` - Excluded backend files
3. ✅ `frontend/.env.production` - Created production env file

## 🎯 Next Steps

1. **Update Backend URL**: Set `REACT_APP_API_URL` in Vercel environment variables
2. **Deploy Backend**: Choose one of the backend deployment options above
3. **Push Changes**: Commit and push to trigger deployment
4. **Test**: Verify the app works at `https://erp-vnzt.vercel.app`

## 📞 Support

If you still see 404 after following these steps:
1. Check Vercel build logs for errors
2. Verify `frontend/build` directory is created during build
3. Ensure environment variables are set in Vercel dashboard
4. Try clearing build cache and redeploying
