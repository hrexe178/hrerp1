# 🎯 Vercel Settings - Correct Configuration

## Project Settings in Vercel Dashboard

### General Settings
```
Project Name: erp-vnzt
Framework Preset: Create React App
Root Directory: ./ (leave as root, NOT frontend)
```

### Build & Development Settings
```
Build Command: cd frontend && npm install && npm run build
Output Directory: frontend/build
Install Command: npm install (default)
Development Command: npm start (default)
```

### Environment Variables
```
REACT_APP_API_URL = https://your-backend-url.com
REACT_APP_NAME = HR ERP System
REACT_APP_ENV = production
```

## ⚙️ How to Access These Settings

1. Go to https://vercel.com/dashboard
2. Click on your project: **erp-vnzt**
3. Click **Settings** (top navigation)
4. Navigate to sections:
   - **General** → Root Directory
   - **Build & Development** → Commands
   - **Environment Variables** → Add variables

## 🔄 After Changing Settings

**Important:** After changing any settings, you must redeploy:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **"Redeploy"** button
4. Optionally check **"Clear Build Cache"** if you changed build settings

## 📋 Quick Verification

After deployment, check:

✅ Build logs show: `cd frontend && npm install && npm run build`  
✅ Output directory: `frontend/build`  
✅ Deployment URL: `https://erp-vnzt.vercel.app`  
✅ Status: Ready (green checkmark)  
✅ Visit URL: Shows login page (not 404)

## 🚨 Common Mistakes to Avoid

❌ **DON'T** set Root Directory to `frontend`  
✅ **DO** keep Root Directory as `./` and use `cd frontend` in build command

❌ **DON'T** use build command: `npm run build`  
✅ **DO** use: `cd frontend && npm install && npm run build`

❌ **DON'T** set output directory to `build`  
✅ **DO** set output directory to `frontend/build`

❌ **DON'T** forget to add environment variables  
✅ **DO** add all `REACT_APP_*` variables in Vercel dashboard

## 📸 Visual Reference

```
┌─────────────────────────────────────────────────────────┐
│ Vercel Dashboard → erp-vnzt → Settings                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Build & Development Settings                           │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Framework Preset                                │   │
│ │ [Create React App                          ▼]  │   │
│ │                                                 │   │
│ │ Build Command                                   │   │
│ │ [cd frontend && npm install && npm run build]  │   │
│ │                                                 │   │
│ │ Output Directory                                │   │
│ │ [frontend/build                            ]   │   │
│ │                                                 │   │
│ │ Install Command                                 │   │
│ │ [npm install                               ]   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [Save] button                                          │
└─────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────┐
│ Vercel Dashboard → erp-vnzt → Settings                 │
│ → Environment Variables                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Add New] button                                       │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Name                                            │   │
│ │ [REACT_APP_API_URL                         ]   │   │
│ │                                                 │   │
│ │ Value                                           │   │
│ │ [https://your-backend-url.com              ]   │   │
│ │                                                 │   │
│ │ Environment                                     │   │
│ │ ☑ Production  ☐ Preview  ☐ Development        │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [Save] button                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Verify in Deployment Logs

When deployment runs, you should see:

```bash
[Build] Running build command: cd frontend && npm install && npm run build
[Build] Installing dependencies...
[Build] Building React app...
[Build] Creating optimized production build...
[Build] Compiled successfully!
[Build] Build completed in 45s
[Deploy] Deploying to production...
[Deploy] Deployment complete
[Ready] https://erp-vnzt.vercel.app
```

## 🎯 Final Check

Visit: `https://erp-vnzt.vercel.app`

**Expected Result:**
```
┌─────────────────────────────────────┐
│                                     │
│         HR ERP System               │
│                                     │
│    ┌─────────────────────────┐     │
│    │ Username                │     │
│    │ [________________]      │     │
│    │                         │     │
│    │ Password                │     │
│    │ [________________]      │     │
│    │                         │     │
│    │      [Login]            │     │
│    └─────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

**NOT:**
```
404: NOT_FOUND
Code: NOT_FOUND
ID: ...
```
