# 🚀 Vercel Backend Automatic Deployment Guide

## ✅ Configuration Complete

Your HR ERP System backend is now configured for **automatic deployment** on Vercel.

---

## 📦 How It Works

### Backend-Only Deployment
- **Backend (Express API)**: Deploys as serverless functions
- **API Routes**: All routes served from `/api/*`
- **Domain**: Backend runs on Vercel URL (e.g., `backend-vnzt.vercel.app`)

### Automatic Deployment
Every time you push to GitHub `main` branch, Vercel will automatically:
1. Build the backend serverless functions
2. Deploy to production
3. Usually takes 1-2 minutes

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
| `FRONTEND_URL` | `https://wonderful-haupia-647cea.netlify.app` (your Netlify frontend URL) | Production |
| `ADMIN_EMAIL` | `admin@hrerp.com` | Production |
| `ADMIN_PASSWORD` | `admin123` | Production |

**Important:** Don't add `PORT` - Vercel handles this automatically.

---

## 📋 Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset**: Other
- **Root Directory**: `backend/`
- **Build Command**: (leave empty - handled by vercel.json)
- **Output Directory**: (leave empty - handled by vercel.json)
- **Install Command**: `npm install`

---

## 🌐 API Routes

All backend routes are available at:
```
https://backend-vnzt.vercel.app/api/auth/login      → Backend API
https://backend-vnzt.vercel.app/api/employees       → Backend API
https://backend-vnzt.vercel.app/api/attendance      → Backend API
https://backend-vnzt.vercel.app/api/projects        → Backend API
https://backend-vnzt.vercel.app/api/health          → Health check
```

---

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure backend for Vercel automatic deployment"
git push origin main
```

### 2. Vercel Auto-Deploys
- Vercel detects the push
- Builds backend serverless functions
- Deploys to production
- Usually takes 1-2 minutes

### 3. Verify Deployment
Test API endpoint: `https://backend-vnzt.vercel.app/api/health`
- Should return: `{"success": true, "message": "Server is running"}`

---

## ✅ What's Configured

### Files Updated:
1. **`backend/vercel.json`** - Backend deployment configuration
   - Builds backend with `@vercel/node`
   - Routes all requests to server.js

2. **`.vercelignore`** - Deployment ignore rules
   - Ignores `node_modules`, `.env`, etc.
   - Allows `backend/` directory

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
- Syntax errors in backend code

### API Not Working
**Check:**
1. Environment variables set in Vercel
2. MongoDB URI is correct
3. IP whitelist in MongoDB Atlas (allow all: `0.0.0.0/0`)
4. CORS settings (FRONTEND_URL should match Netlify URL)

---

## 📊 Expected Behavior

### After Successful Deployment:

1. **Health Check**: `https://backend-vnzt.vercel.app/api/health`
   - ✅ Returns success message

2. **API Endpoints**:
   - ✅ All `/api/*` routes work
   - ✅ CORS allows Netlify frontend
   - ✅ JWT authentication works

---

## 🔄 Development Workflow

### Local Development
```bash
npm run dev
```
- Backend: http://localhost:5000

### Deploy to Production
```bash
git add .
git commit -m "Your backend changes"
git push origin main
```
- Vercel auto-deploys backend
- Live at: https://backend-vnzt.vercel.app

---

## 📝 Important Notes

1. **MongoDB Atlas**: Make sure to whitelist Vercel IPs or use `0.0.0.0/0`
2. **Environment Variables**: Must be set in Vercel Dashboard
3. **Serverless Functions**: Backend runs as serverless functions (not always-on server)
4. **Cold Starts**: First API request after inactivity may be slow (serverless cold start)
5. **Frontend Integration**: Frontend should use `REACT_APP_API_URL=https://backend-vnzt.vercel.app`

---

## 🎯 Next Steps

1. ✅ Push code to GitHub
2. ✅ Set environment variables in Vercel
3. ✅ Wait for deployment to complete
4. ✅ Test API endpoints
5. ✅ Deploy frontend to Netlify
6. ✅ Update frontend API_URL to backend URL

---

## 🆘 Support

If deployment fails:
1. Check Vercel build logs
2. Verify environment variables
3. Check MongoDB connection
4. Review this guide

---

**Status:** ✅ Ready for automatic Vercel backend deployment!

**Repository:** https://github.com/hrexe178/hrerp1

**Vercel Project:** backend-vnzt

**Last Updated:** 2026-01-20
