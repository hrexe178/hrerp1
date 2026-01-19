# HR ERP System - Quick Reference Card

## 🚀 Getting Started (5 Minutes)

```bash
# 1. Install dependencies
npm run install-all

# 2. Configure .env
cp .env.example .env
# Edit .env with:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A strong random string

# 3. Seed admin user
npm run seed

# 4. Start development server
npm run dev

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
# Login: admin@hrerp.com / admin123
```

## 📁 Project Commands

| Command | Purpose |
|---------|---------|
| `npm run install-all` | Install all dependencies (root + backend + frontend) |
| `npm run dev` | Start both backend (5000) and frontend (3000) |
| `npm run server` | Start backend only with auto-reload (nodemon) |
| `npm run client` | Start frontend only |
| `npm run seed` | Create admin user in database |
| `npm run build` | Build frontend for production |

## 🔑 Environment Variables Required

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hrerp
JWT_SECRET=generate-strong-random-string-32-chars-min
NODE_ENV=development|production
PORT=5000
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@hrerp.com
ADMIN_PASSWORD=admin123
```

## 📊 API Quick Commands

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrerp.com","password":"admin123"}'

# Get Current User (use token from login response)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# List Employees
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Health Check (no auth needed)
curl http://localhost:5000/api/health
```

## 🔐 Roles & Permissions

| Action | Admin | HR | Manager | Employee |
|--------|-------|-----|---------|----------|
| Create Employee | ✅ | ✅ | ❌ | ❌ |
| View All Employees | ✅ | ✅ | ✅ | ✅ |
| Record Attendance | ✅ | ✅ | ✅ | ✅ |
| Approve Leave | ✅ | ✅ | ✅ | ❌ |
| Create Project | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ❌ | ❌ |

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **Port 5000 in use** | `lsof -ti:5000 \| xargs kill -9` |
| **Module not found** | `npm run install-all` |
| **MongoDB connection fails** | Check MONGODB_URI, verify IP whitelist |
| **Login fails** | Run `npm run seed` to create admin user |
| **CORS errors** | Verify FRONTEND_URL env variable |
| **JWT errors** | Verify JWT_SECRET matches in .env |

## 📂 Important File Locations

```
Backend:
├── backend/server.js           # Main server entry point
├── backend/config/db.js        # MongoDB connection
├── backend/middleware/auth.js  # Authentication logic
└── backend/routes/             # API route definitions

Frontend:
├── frontend/src/App.jsx        # Main React component
├── frontend/src/context/AuthContext.jsx  # Auth state
├── frontend/src/utils/api.js   # Axios setup
└── frontend/src/components/    # React components
```

## 🚀 Deploy to Vercel

```bash
# 1. Push to GitHub
git add . && git commit -m "Deploy" && git push

# 2. Go to vercel.com and import repository

# 3. Set Environment Variables:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=strong_random_string
FRONTEND_URL=your_vercel_domain.vercel.app

# 4. Deploy and wait for completion

# 5. Access at: your_vercel_domain.vercel.app
```

## 💾 Database Models Summary

| Model | Key Fields | Auto ID |
|-------|-----------|---------|
| User | email (unique), password (hashed), role, lastLogin | No |
| Employee | employeeId (unique) | Yes (EMP...) |
| Attendance | employee, date (unique combo), status, leaveType | No |
| Project | projectId (unique) | Yes (PRJ...) |
| Document | name, fileUrl, version, accessLevel | No |

## 🔗 API Endpoint Groups

### Auth (`/api/auth`)
- POST /register - Create account
- POST /login - Login user
- GET /me - Current user (protected)
- POST /logout - Logout (protected)

### Employees (`/api/employees`)
- GET / - List all
- GET /:id - Get one
- POST / - Create (HR/Admin)
- PUT /:id - Update (HR/Admin)
- DELETE /:id - Delete (Admin)
- GET /stats/summary - Statistics (HR/Admin)

### Attendance (`/api/attendance`)
- GET / - List
- GET /employee/:id - Employee history
- GET /report/:month/:year - Monthly report
- POST / - Create (HR/Admin)
- PUT /:id - Update (HR/Admin)
- DELETE /:id - Delete (HR/Admin)

### Projects (`/api/projects`)
- GET / - List
- GET /:id - Get one
- POST / - Create (HR/Admin)
- PUT /:id - Update (HR/Admin)
- DELETE /:id - Delete (HR/Admin)
- POST /:id/assign-employee - Add team member
- DELETE /:id/remove-employee/:empId - Remove team member

### Documents (`/api/documents`)
- GET / - List
- GET /project/:id - Project docs
- GET /employee/:id - Employee docs
- POST / - Upload
- PUT /:id - Update
- DELETE /:id - Soft delete

## 🧪 Test User Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hrerp.com | admin123 |
| (Create in app) | hr@company.com | any_password |
| (Create in app) | manager@company.com | any_password |

## 📈 Performance Tips

1. **Database**: Verify indexes on frequently queried fields
2. **Frontend**: Use lazy loading for large lists
3. **Backend**: Implement pagination with limit/skip
4. **Caching**: Consider Redis for frequently accessed data
5. **Monitoring**: Check Vercel analytics regularly

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Rotate JWT_SECRET periodically
- [ ] Enable HTTPS (Vercel does this automatically)
- [ ] Regular database backups
- [ ] Monitor access logs
- [ ] Keep dependencies updated

## 📚 Documentation Files

| File | Contains |
|------|----------|
| README.md | Complete system documentation |
| SETUP.md | Detailed setup instructions |
| DEPLOYMENT_GUIDE.md | Production deployment guide |
| .env.example | Environment variables template |

## 💡 Common Workflows

### Create New Employee
1. Login as Admin/HR
2. Go to Employees → Create
3. Fill form and submit
4. Employee appears in list

### Record Attendance
1. Go to Attendance
2. Select Employee, Date, Status
3. Add check-in/check-out times
4. Save

### Create Project
1. Go to Projects → Create
2. Enter project details
3. Assign team members
4. Set milestones and budget
5. Save

### Generate Report
1. Go to Reports
2. Select date range and type
3. Click Export CSV
4. Download report

## ⏰ Typical Response Times

| Operation | Expected Time |
|-----------|---------------|
| Login | 200-500ms |
| Load Employee List | 500-800ms |
| Create Employee | 300-600ms |
| Get Dashboard Stats | 400-700ms |
| Export to CSV | 1000-2000ms |

## 🔄 Workflow Diagram

```
User Login
    ↓
JWT Token Generated
    ↓
Token Stored in localStorage
    ↓
Axios Interceptor Injects Token
    ↓
Protected Route Accessed
    ↓
Backend Verifies JWT
    ↓
Return Protected Resource
```

## 📞 Getting Help

1. Check error message in browser console (F12)
2. Check server logs: `npm run dev`
3. Review SETUP.md and DEPLOYMENT_GUIDE.md
4. Check MongoDB Atlas status
5. Verify all environment variables

## ✅ Deployment Checklist

Before deploying to Vercel:
- [ ] All npm dependencies installed
- [ ] Local testing passed
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables configured
- [ ] Code committed to GitHub
- [ ] No console errors
- [ ] All routes working
- [ ] Admin user created with seed

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**For Full Details**: See README.md
