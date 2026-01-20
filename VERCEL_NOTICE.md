# ⚠️ Vercel Deployment Notice

This project is configured for **localhost development only**.

## Why Vercel Builds Fail

This is a **monorepo** with both backend (Express.js) and frontend (React) that are designed to run together locally. Vercel deployments will fail because:

1. **Backend requires MongoDB** - Cannot run serverless without proper configuration
2. **Development command** - `npm run dev` runs both servers concurrently (not suitable for Vercel)
3. **Localhost-only design** - Environment variables point to `localhost:5000` and `localhost:3000`

## To Disable Vercel Deployments

If this repository is connected to Vercel and you want to stop automatic deployments:

### Option 1: Disconnect from Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Git**
4. Click **Disconnect** to unlink the repository

### Option 2: Keep Connected but Ignore Builds
The current `vercel.json` and `.vercelignore` are configured to prevent builds:
- `vercel.json` has empty builds array
- `.vercelignore` ignores all files

## For Localhost Development

Follow the instructions in `LOCALHOST_GUIDE.md` or `QUICK_START_LOCALHOST.md`:

```bash
# Install dependencies
npm run install-all

# Run both backend and frontend
npm run dev
```

Access at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## If You Want to Deploy to Vercel

You would need to:
1. Deploy backend and frontend separately
2. Use a managed MongoDB service (MongoDB Atlas)
3. Configure environment variables in Vercel dashboard
4. Update build commands for frontend-only or backend-only deployment

See the previous Vercel documentation (if available in git history) or contact the development team.

---

**Current Status:** ✅ Configured for localhost development only
