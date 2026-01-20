# 🚀 Vercel Automatic Deployment Guide

## ✅ Configuration Complete

Your HR ERP System is now configured for **automatic deployment** on Vercel with both frontend and backend together.

---

## 📦 How It Works

### Monorepo Deployment
- **Frontend (React)**: Builds and serves from `/`
- **Backend (Express API)**: Serves from `/api/*`
- **Single Domain**: Both run on same Vercel URL (e.g., `erp-vnzt.vercel.app`)

### Automatic Deployment
Every time you push to GitHub `main` branch, Vercel will automatically:
1. Build the frontend (`npm run build` in frontend/)
2. Deploy the backend serverless functions
3. Route requests correctly between frontend and backend

---

## 🔧 Vercel Dashboard Configuration

### Environment Variables (REQUIRED)

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` (your MongoDB connection string) | Production |
| `JWT_SECRET` | `f3738f4141e38ddba31d9b65ce7f24738a89553c67e42b7a07dac829ecde5f89` | Production |
| `NODE_ENV` | `production` | Production |
| `ADMIN_EMAIL` | `admin@hrerp.com` | Production |
| `ADMIN_PASSWORD` | `admin123` | Production |

**Important:** Don't add `PORT` or `FRONTEND_URL` - Vercel handles these automatically.

---

## 📋 Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset**: Other
- **Root Directory**: `./` (leave as root)
- **Build Command**: (leave empty - handled by vercel.json)
- **Output Directory**: (leave empty - handled by vercel.json)
- **Install Command**: `npm install`

---

## 🌐 How Routing Works

### Frontend Routes
```
https://erp-vnzt.vercel.app/          → React App (Login page)
https://erp-vnzt.vercel.app/dashboard → React App (Dashboard)
https://erp-vnzt.vercel.app/employees → React App (Employees)
```

### Backend API Routes
```
https://erp-vnzt.vercel.app/api/auth/login      → Backend API
https://erp-vnzt.vercel.app/api/employees       → Backend API
https://erp-vnzt.vercel.app/api/attendance      → Backend API
https://erp-vnzt.vercel.app/api/projects        → Backend API
```

---

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure for Vercel automatic deployment"
git push origin main
```

### 2. Vercel Auto-Deploys
- Vercel detects the push
- Builds frontend and backend
- Deploys to production
- Usually takes 2-3 minutes

### 3. Verify Deployment
Visit: `https://erp-vnzt.vercel.app`
- Should show login page
- API calls should work automatically

---

## ✅ What's Configured

### Files Updated:
1. **`vercel.json`** - Deployment configuration
   - Builds backend with `@vercel/node`
   - Builds frontend with `@vercel/static-build`
   - Routes `/api/*` to backend
   - Routes everything else to frontend

2. **`.vercelignore`** - Deployment ignore rules
   - Ignores `node_modules`, `.env`, etc.
   - Allows `backend/` and `frontend/build/`

3. **`frontend/.env.production`** - Production env vars
   - `REACT_APP_API_URL=/api` (relative URL)

4. **`frontend/package.json`** - Added `vercel-build` script

---

## 🔍 Troubleshooting

### Build Fails
**Check Vercel build logs:**
1. Go to Vercel Dashboard → Deployments
2. Click on failed deployment
3. Check build logs for errors

**Common issues:**
- Missing environment variables
- MongoDB connection string incorrect
- Build errors in frontend

### API Not Working
**Check:**
1. Environment variables set in Vercel
2. MongoDB URI is correct
3. IP whitelist in MongoDB Atlas (allow all: `0.0.0.0/0`)

### Frontend Shows But API Fails
**Check:**
1. `REACT_APP_API_URL=/api` in production env
2. Backend routes are `/api/*`
3. CORS settings in backend (should allow Vercel domain)

---

## 📊 Expected Behavior

### After Successful Deployment:

1. **Visit Root URL**: `https://erp-vnzt.vercel.app`
   - ✅ Shows login page
   - ✅ No 404 error

2. **Login**:
   - ✅ API call to `/api/auth/login` works
   - ✅ JWT token received
   - ✅ Redirects to dashboard

3. **Navigate**:
   - ✅ All routes work (employees, attendance, projects)
   - ✅ API calls work
   - ✅ No CORS errors

---

## 🔄 Development Workflow

### Local Development
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Deploy to Production
```bash
git add .
git commit -m "Your changes"
git push origin main
```
- Vercel auto-deploys
- Live at: https://erp-vnzt.vercel.app

---

## 📝 Important Notes

1. **MongoDB Atlas**: Make sure to whitelist Vercel IPs or use `0.0.0.0/0`
2. **Environment Variables**: Must be set in Vercel Dashboard
3. **Serverless Functions**: Backend runs as serverless functions (not always-on server)
4. **Cold Starts**: First API request after inactivity may be slow (serverless cold start)

---

## 🎯 Next Steps

1. ✅ Push code to GitHub
2. ✅ Set environment variables in Vercel
3. ✅ Wait for deployment to complete
4. ✅ Test the live application
5. ✅ Seed admin user (if needed)

---

## 🆘 Support

If deployment fails:
1. Check Vercel build logs
2. Verify environment variables
3. Check MongoDB connection
4. Review this guide

---

**Status:** ✅ Ready for automatic Vercel deployment!

**Repository:** https://github.com/hrexe178/hrerp1

**Vercel Project:** erp-vnzt

**Last Updated:** 2026-01-20
