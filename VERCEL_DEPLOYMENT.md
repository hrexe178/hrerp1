# Vercel Deployment Guide for HR ERP System

## 🚀 Complete Vercel Deployment Setup

This guide will help you deploy both the frontend and backend of your HR ERP System to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **MongoDB Atlas**: Have your MongoDB connection string ready

---

## 📦 Project Structure

```
hr-erp-system/
├── backend/          # Node.js/Express API
├── frontend/         # React Application
├── vercel.json       # Vercel configuration (for backend)
└── package.json      # Root package.json
```

---

## 🔧 Step 1: Environment Variables Setup

### Backend Environment Variables (Vercel Project Settings)

Add these in your Vercel project settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hr-erp?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend Environment Variables

Create `.env.production` in the `frontend/` directory:

```
REACT_APP_API_URL=https://your-backend-api.vercel.app
REACT_APP_NAME=HR ERP System
REACT_APP_ENV=production
```

---

## 🌐 Step 2: Deploy Backend API

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project root
cd "d:\HR ERP\hr-erp-system"

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? hr-erp-backend
# - Directory? ./
# - Override settings? No
```

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
4. Add environment variables (from Step 1)
5. Click **Deploy**

### Get Your Backend URL

After deployment, you'll get a URL like:
```
https://hr-erp-backend-abc123.vercel.app
```

**Important**: Your API endpoints will be at:
```
https://hr-erp-backend-abc123.vercel.app/api/auth/login
https://hr-erp-backend-abc123.vercel.app/api/employees
etc.
```

---

## 🎨 Step 3: Deploy Frontend

### Update Frontend Environment Variable

1. Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://hr-erp-backend-abc123.vercel.app
```

2. Update `frontend/package.json` to ensure it has:
```json
{
  "scripts": {
    "build": "react-scripts build"
  }
}
```

### Deploy Frontend to Vercel

```bash
# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Or deploy via Vercel Dashboard:
# 1. Create new project
# 2. Import repository
# 3. Set Root Directory: frontend
# 4. Framework: Create React App
# 5. Add environment variables
# 6. Deploy
```

---

## ✅ Step 4: Verification

### Test Backend API

```bash
# Health check
curl https://your-backend-api.vercel.app/api/health

# Should return:
# {"success":true,"message":"Server is running"}
```

### Test Frontend

1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Try logging in with demo credentials:
   - Email: `admin@hrerp.com`
   - Password: `admin123`

---

## 🔐 Step 5: Seed Database (First Time Only)

If you haven't seeded your database yet:

```bash
# Locally, with production MongoDB URI
cd backend
node seed.js
```

Or create a temporary Vercel function to seed:

1. Create `backend/api/seed.js`:
```javascript
const connectDB = require('../config/db');
const User = require('../models/User');

module.exports = async (req, res) => {
  try {
    await connectDB();
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@hrerp.com' });
    if (adminExists) {
      return res.json({ message: 'Admin already exists' });
    }

    // Create admin
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@hrerp.com',
      password: 'admin123',
      role: 'admin'
    });

    res.json({ success: true, message: 'Admin created', data: admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

2. Visit: `https://your-backend-api.vercel.app/api/seed`
3. Delete the seed endpoint after use

---

## 🐛 Troubleshooting

### Issue: "Cannot GET /"
**Solution**: This is normal for the backend. API routes are at `/api/*`

### Issue: "Network Error" in frontend
**Solution**: 
1. Check `REACT_APP_API_URL` in frontend `.env.production`
2. Ensure backend is deployed and running
3. Check browser console for CORS errors

### Issue: "401 Unauthorized"
**Solution**: 
1. Clear browser localStorage
2. Log in again
3. Check JWT_SECRET is set in backend environment variables

### Issue: "MongoDB connection failed"
**Solution**:
1. Verify MONGODB_URI in Vercel environment variables
2. Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
3. Ensure database user has correct permissions

---

## 📝 Important Notes

### API Endpoints
All API calls from frontend should use the environment variable:
```javascript
import api from '../utils/api';

// Correct
api.get('/api/employees');

// Incorrect (hardcoded)
axios.get('http://localhost:5000/api/employees');
```

### CORS Configuration
The backend `server.js` already has CORS configured to accept requests from the frontend URL specified in `FRONTEND_URL` environment variable.

### Database
- Use MongoDB Atlas (free tier available)
- Whitelist all IPs (0.0.0.0/0) for Vercel serverless functions
- Keep connection string secure in environment variables

---

## 🔄 Continuous Deployment

Once set up, Vercel will automatically deploy when you push to GitHub:

1. **Push to main branch** → Automatic production deployment
2. **Push to other branches** → Automatic preview deployment

---

## 📊 Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor function invocations
- Check error rates
- View analytics

### MongoDB Atlas
- Monitor database connections
- Check query performance
- View storage usage

---

## 🎯 Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Get backend URL
3. ✅ Update frontend environment variables
4. ✅ Deploy frontend to Vercel
5. ✅ Seed database
6. ✅ Test login and features
7. ✅ Set up custom domain (optional)

---

## 🆘 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test API endpoints directly with curl/Postman
5. Check MongoDB Atlas connection

---

## 🎉 Success Checklist

- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Database seeded with admin user
- [ ] Can log in successfully
- [ ] All features working (employees, projects, attendance, documents)
- [ ] No console errors
- [ ] API calls successful

---

**Your HR ERP System is now live on Vercel! 🚀**
