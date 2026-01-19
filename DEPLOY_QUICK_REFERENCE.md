# Vercel Deployment - Quick Reference Card

## 🚀 Deploy Backend (API)

```bash
cd "d:\HR ERP\hr-erp-system"
vercel
```

**Environment Variables to Set in Vercel Dashboard:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `NODE_ENV` - Set to `production`
- `FRONTEND_URL` - Your frontend URL (after deploying frontend)

**Your API will be at:** `https://your-project-name.vercel.app/api/*`

---

## 🎨 Deploy Frontend

```bash
cd "d:\HR ERP\hr-erp-system\frontend"
vercel
```

**Before deploying, create `.env.production`:**
```
REACT_APP_API_URL=https://your-backend-api.vercel.app
```

**Environment Variables to Set in Vercel Dashboard:**
- `REACT_APP_API_URL` - Your backend API URL

---

## ✅ Quick Verification

### Test Backend
```bash
curl https://your-backend.vercel.app/api/health
```

Should return: `{"success":true,"message":"Server is running"}`

### Test Frontend
Visit: `https://your-frontend.vercel.app`

Login with:
- Email: `admin@hrerp.com`
- Password: `admin123`

---

## 🔄 Update After Changes

```bash
# Backend
cd "d:\HR ERP\hr-erp-system"
git add .
git commit -m "Update backend"
git push

# Frontend
cd frontend
git add .
git commit -m "Update frontend"
git push
```

Vercel will auto-deploy on push!

---

## 📝 Important URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Backend API**: https://your-backend.vercel.app
- **Frontend App**: https://your-frontend.vercel.app

---

## 🆘 Emergency Commands

### View Logs
```bash
vercel logs
```

### Rollback Deployment
```bash
vercel rollback
```

### List Deployments
```bash
vercel ls
```

---

**Need help? Check `VERCEL_DEPLOYMENT.md` for detailed instructions!**
