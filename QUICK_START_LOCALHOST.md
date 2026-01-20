# 🚀 Quick Start - Localhost Development

## ⚡ 3 Steps to Run

### 1. Install Dependencies (First Time Only)
```bash
npm run install-all
```

### 2. Configure Environment
Verify `.env` file in root directory exists with:
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Verify `frontend/.env` exists with:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Run Application
```bash
npm run dev
```

---

## 🌐 Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

---

## 🔐 Login Credentials

First, seed the admin user:
```bash
npm run seed
```

Then login with:
- **Email:** admin@hrerp.com
- **Password:** admin123

---

## 📋 Common Commands

```bash
npm run dev          # Run both backend + frontend
npm run server       # Run backend only
npm run client       # Run frontend only
npm run seed         # Create admin user
npm run install-all  # Install all dependencies
```

---

## 🐛 Quick Fixes

### Port 5000 Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB Connection Error
1. Check `MONGODB_URI` in `.env`
2. Verify IP whitelist in MongoDB Atlas
3. Check internet connection

### Module Not Found
```bash
npm run install-all
```

---

## ✅ Verification Checklist

- [ ] Node.js installed (v14+)
- [ ] Dependencies installed
- [ ] `.env` configured
- [ ] `frontend/.env` configured
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can login with admin credentials

---

## 📖 Full Documentation

See `LOCALHOST_GUIDE.md` for detailed documentation.

---

**Status:** ✅ Ready for localhost development!
