# 🏠 HR ERP System - Localhost Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend (.env in root directory)
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://vysoftware91_db_user:8f8VusqwK8pldu2R@cluster0.tm8evwf.mongodb.net/

# JWT Secret
JWT_SECRET=f3738f4141e38ddba31d9b65ce7f24738a89553c67e42b7a07dac829ecde5f89

# Server Configuration
NODE_ENV=development
PORT=5000
BACKEND_PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Admin Seeding (optional)
ADMIN_EMAIL=admin@hrerp.com
ADMIN_PASSWORD=admin123
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

#### Frontend (frontend/.env)
```env
# React App Environment Variables
REACT_APP_API_URL=http://localhost:5000
REACT_APP_NAME=HR ERP System
REACT_APP_ENV=development
```

### 3. Run the Application

#### Option A: Run Both (Recommended)
```bash
# From root directory
npm run dev
```
This runs both backend (port 5000) and frontend (port 3000) concurrently.

#### Option B: Run Separately

**Terminal 1 - Backend:**
```bash
npm run server
# or
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
npm run client
# or
cd frontend
npm start
```

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

### 5. Seed Admin User (Optional)

```bash
npm run seed
```

This creates an admin user with credentials:
- Email: admin@hrerp.com
- Password: admin123

---

## 📁 Project Structure

```
hr-erp-system/
├── backend/                    # Express.js API
│   ├── config/                # Database configuration
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Auth & error handling
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
│   ├── seed.js                # Database seeding
│   └── server.js              # Entry point
│
├── frontend/                   # React application
│   ├── public/                # Static files
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── config/            # API configuration
│   │   ├── context/           # Auth context
│   │   ├── styles/            # CSS files
│   │   └── utils/             # Utility functions
│   └── package.json
│
├── .env                       # Backend environment variables
└── package.json               # Root package.json
```

---

## 🔧 Available Scripts

### Root Level
```bash
npm run dev          # Run both backend and frontend
npm run server       # Run backend only (with nodemon)
npm run client       # Run frontend only
npm start            # Run backend in production mode
npm run seed         # Seed admin user
npm run install-all  # Install all dependencies
```

### Backend
```bash
cd backend
node server.js       # Run backend
npm run seed         # Seed database
```

### Frontend
```bash
cd frontend
npm start            # Run development server (port 3000)
npm run build        # Build for production
npm test             # Run tests
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/:id` - Get attendance by ID
- `GET /api/attendance/employee/:employeeId` - Get employee attendance
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/assign-employee` - Assign employee to project
- `DELETE /api/projects/:id/remove-employee/:employeeId` - Remove employee from project

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get document by ID
- `GET /api/documents/project/:projectId` - Get project documents
- `GET /api/documents/employee/:employeeId` - Get employee documents
- `POST /api/documents` - Create document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Health Check
- `GET /api/health` - Server health check

---

## 🔐 Default Credentials

After running `npm run seed`:

**Admin User:**
- Email: admin@hrerp.com
- Password: admin123

---

## 🐛 Troubleshooting

### Port Already in Use

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Alternative: Change port in .env
PORT=5001
```

**Frontend (Port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Alternative: Change port
# frontend/package.json: "start": "cross-env PORT=3001 react-scripts start"
```

### MongoDB Connection Issues

1. Check MongoDB URI in `.env`
2. Verify network access in MongoDB Atlas
3. Whitelist your IP address in MongoDB Atlas

### CORS Errors

Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL:
```env
FRONTEND_URL=http://localhost:3000
```

### Module Not Found

```bash
# Reinstall dependencies
npm run install-all

# Or individually
cd backend && npm install
cd ../frontend && npm install
```

### React App Not Loading

1. Clear browser cache
2. Delete `node_modules` and reinstall:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Development Workflow

### 1. Start Development
```bash
npm run dev
```

### 2. Make Changes
- Backend changes auto-reload (nodemon)
- Frontend changes auto-reload (React hot reload)

### 3. Test API
Use tools like:
- Postman
- Thunder Client (VS Code extension)
- Browser DevTools

### 4. Check Logs
- Backend logs in terminal
- Frontend logs in browser console (F12)

---

## 🔄 Database Management

### Seed Database
```bash
npm run seed
```

### Reset Database
1. Go to MongoDB Atlas
2. Delete all collections
3. Run seed script again

### Backup Database
```bash
# Using MongoDB Compass or Atlas UI
# Export collections as JSON
```

---

## 🎯 Features

### ✅ Implemented
- User authentication (JWT)
- Employee management (CRUD)
- Attendance tracking
- Project management
- Document management
- Role-based access control
- Responsive UI

### 🚧 Planned
- Advanced reporting
- Email notifications
- File uploads
- Dashboard analytics
- Export to Excel/PDF

---

## 📝 Environment Variables Reference

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret for JWT tokens | Required |
| `NODE_ENV` | Environment mode | development |
| `PORT` | Backend server port | 5000 |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `ADMIN_EMAIL` | Admin user email | admin@hrerp.com |
| `ADMIN_PASSWORD` | Admin user password | admin123 |

### Frontend (frontend/.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | http://localhost:5000 |
| `REACT_APP_NAME` | Application name | HR ERP System |
| `REACT_APP_ENV` | Environment mode | development |

---

## 🚀 Performance Tips

1. **Use Chrome DevTools** to monitor performance
2. **Enable React DevTools** extension
3. **Monitor MongoDB** queries in Atlas
4. **Use nodemon** for backend auto-reload
5. **Clear browser cache** if issues persist

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review error logs in terminal/console
3. Check MongoDB Atlas connection
4. Verify environment variables

---

## ✅ Checklist

Before starting development:
- [ ] Node.js installed
- [ ] MongoDB Atlas account created
- [ ] Dependencies installed (`npm run install-all`)
- [ ] Environment variables configured
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Admin user seeded
- [ ] Can login successfully

---

**Status:** ✅ Localhost development environment ready!

**Last Updated:** 2026-01-20
