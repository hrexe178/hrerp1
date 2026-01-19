# HR ERP System - Complete Setup Guide

## ✅ What Has Been Created

### Backend (Production-Ready)
- ✅ MongoDB models with comprehensive fields
- ✅ JWT authentication with RBAC (Admin, HR, Manager, Employee)
- ✅ Express routes with validation
- ✅ Error handling middleware
- ✅ Admin user seeding script
- ✅ 5 main modules: Auth, Employee, Attendance, Project, Document

### Frontend (React Components Ready)
- ✅ React Router setup
- ✅ Auth Context for state management
- ✅ Axios API client with interceptors
- ✅ Helper functions and utilities
- ✅ CSS styling foundation

### Deployment Ready
- ✅ Vercel configuration
- ✅ Environment templates
- ✅ Root package.json with build scripts
- ✅ Monorepo structure

## 🚀 Getting Started

### 1. Initial Setup

```bash
# Install all dependencies
npm run install-all

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment (.env)

```env
# MongoDB - Get from MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hr-erp?retryWrites=true&w=majority

# JWT Secret - Change to something secure!
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345

# Server Config
NODE_ENV=development
PORT=5000

# Frontend
FRONTEND_URL=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@hrerp.com
ADMIN_PASSWORD=admin123
```

### 3. Seed Admin User

```bash
npm run seed
```

Output:
```
✅ Admin user created successfully
📧 Email: admin@hrerp.com
🔐 Password: admin123
⚠️  Please change the password after first login
```

### 4. Run Application

```bash
# Start both backend and frontend
npm run dev

# Or separately:
# Terminal 1: npm run server
# Terminal 2: npm run client
```

### 5. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

### 6. Login

```
Email: admin@hrerp.com
Password: admin123
```

## 📋 API Quick Reference

### Authentication
```bash
# Register
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee"
}

# Login
POST /api/auth/login
{
  "email": "admin@hrerp.com",
  "password": "admin123"
}

# Get Current User
GET /api/auth/me
(Header: Authorization: Bearer <token>)
```

### Employees
```bash
# List all employees
GET /api/employees
?search=John&department=IT&status=Active

# Get single employee
GET /api/employees/:id

# Create employee
POST /api/employees
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "joiningDate": "2024-01-15",
  "department": "HR",
  "designation": "HR Manager"
}

# Update employee
PUT /api/employees/:id

# Delete employee
DELETE /api/employees/:id

# Get statistics
GET /api/employees/stats/summary
```

### Attendance
```bash
# List attendance
GET /api/attendance
?employeeId=xxx&startDate=2024-01-01&endDate=2024-01-31

# Get employee attendance
GET /api/attendance/employee/:employeeId

# Get monthly report
GET /api/attendance/report/1/2024
(month/year format)

# Mark attendance
POST /api/attendance
{
  "employee": "empId",
  "date": "2024-01-15",
  "status": "Present",
  "checkInTime": "09:00",
  "checkOutTime": "18:00",
  "location": "Office"
}

# Update attendance
PUT /api/attendance/:id

# Delete attendance
DELETE /api/attendance/:id
```

### Projects
```bash
# List projects
GET /api/projects
?status=In Progress&search=ProjectName

# Get project details
GET /api/projects/:id

# Create project
POST /api/projects
{
  "name": "New Project",
  "description": "Project description",
  "startDate": "2024-02-01",
  "manager": "managerId",
  "status": "Planning",
  "priority": "High",
  "budget": {
    "estimated": 50000,
    "currency": "INR"
  }
}

# Update project
PUT /api/projects/:id

# Delete project
DELETE /api/projects/:id

# Assign employee to project
POST /api/projects/:id/assign-employee
{
  "employeeId": "empId",
  "role": "Developer",
  "allocationPercentage": 100
}

# Remove employee from project
DELETE /api/projects/:id/remove-employee/:employeeId
```

### Documents
```bash
# List documents
GET /api/documents
?type=Project Document&tag=contract

# Get project documents
GET /api/documents/project/:projectId

# Get employee documents
GET /api/documents/employee/:employeeId

# Create document
POST /api/documents
{
  "name": "Contract",
  "type": "Contract",
  "fileUrl": "https://example.com/contract.pdf",
  "fileType": "PDF",
  "project": "projectId",
  "employee": "employeeId",
  "accessLevel": "Private",
  "tags": ["important", "contract"]
}

# Update document
PUT /api/documents/:id

# Delete document
DELETE /api/documents/:id
```

## 🔐 Authentication

All protected endpoints require the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token is automatically included by the Axios interceptor in the frontend.

## 🛣️ Frontend Routes

```
/login                     - Login page
/                          - Dashboard (protected)
/employees                 - Employee list
/employees/new             - Create employee
/employees/:id             - Employee details
/employees/:id/edit        - Edit employee
/attendance                - Attendance management
/projects                  - Project list
/projects/:id              - Project details
/documents                 - Document manager
/reports                   - Reports & analytics
```

## 📊 Database Schema Overview

### User
```
- id (ObjectId)
- firstName, lastName, email (unique), password
- role (admin, hr, manager, employee)
- isActive, lastLogin
- timestamps
```

### Employee
```
- employeeId (unique, auto-generated)
- Personal: firstName, lastName, email, phone, DOB, gender, address, emergencyContact
- Professional: department, designation, employmentType, joiningDate, reportingManager, workLocation, employmentStatus
- Compensation: salary, currency, paymentFrequency, bankDetails
- Documents: resume, documents array, skills array
- Education & Experience arrays
- performanceReviews array
- projects array (references)
- timestamps
```

### Attendance
```
- employee (ref), date
- status (Present, Absent, Half-Day, Leave, Holiday, Weekend)
- checkInTime, checkOutTime, workHours, overtimeHours
- location, leaveType, leaveReason
- approvedBy (ref), isApproved
- remarks, timestamps
- Unique index: employee + date
```

### Project
```
- projectId (unique, auto-generated)
- name, description
- client: {name, email, phone, company}
- manager (ref), teamMembers array with allocation
- startDate, endDate, actualEndDate
- status, priority
- budget: {estimated, actual, currency}
- technologyStack array
- milestones array, risks array
- progressPercentage, notes, tags
- timestamps
```

### Document
```
- name, description
- type (Project Document, Employee Document, Contract, Report, Invoice, Policy, Other)
- fileUrl, fileType, fileSize
- project (ref), employee (ref)
- uploadedBy (ref User)
- uploadDate, version, tags
- accessLevel (Public, Private, Restricted)
- expiryDate, isActive
- timestamps
```

## 🚨 Important Notes

1. **Change Admin Password:** After first login, update admin password
2. **JWT Secret:** Use a strong, random JWT_SECRET in production
3. **MongoDB Connection:** Ensure whitelist IP address in MongoDB Atlas
4. **CORS:** Frontend URL must be configured correctly
5. **Environment Variables:** Never commit `.env` file to git

## 📦 Deploying to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial HR ERP deployment"
git push origin main
```

2. **Create Vercel Project**
- Go to https://vercel.com
- Click "Add New" → "Project"
- Import your GitHub repository
- Vercel auto-detects monorepo

3. **Set Environment Variables**
In Project Settings → Environment Variables:
- `MONGODB_URI` = Your MongoDB Atlas connection string
- `JWT_SECRET` = Your secure secret key
- `FRONTEND_URL` = auto-filled with Vercel domain
- `ADMIN_EMAIL` = admin@hrerp.com
- `ADMIN_PASSWORD` = Your secure admin password

4. **Deploy**
```bash
git push
```

Your application is now live on Vercel!

## 🧪 Testing the System

### Test Scenario: Admin Marks Attendance

1. Login as admin
2. Navigate to Attendance
3. Click "Mark Attendance"
4. Select employee, date, status
5. Click "Save"
6. View in attendance list

### Test Scenario: Create Project with Team

1. Login as admin/HR
2. Go to Projects
3. Click "Create Project"
4. Fill details and save
5. Click "Assign Employee"
6. Select employees and allocations
7. View in project dashboard

### Test Scenario: Upload Document

1. Login as any user
2. Go to Documents
3. Click "New Document"
4. Fill details (provide document URL)
5. Select project/employee
6. Save
7. View in document manager

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| ECONNREFUSED 27017 | MongoDB not running or invalid URI |
| Invalid token | Token expired, login again |
| CORS error | Check FRONTEND_URL environment variable |
| Admin not created | Run `npm run seed` |
| Port 5000 in use | Kill process: `lsof -ti:5000 \| xargs kill -9` |
| Frontend build fails | Delete node_modules, run `npm install` |

## 📚 Next Steps

1. ✅ Create additional React components as needed
2. ✅ Add more validation rules
3. ✅ Implement pagination for large datasets
4. ✅ Add email notifications
5. ✅ Set up backup strategy
6. ✅ Monitor and optimize performance

## 💬 Support

For detailed documentation, see README.md
For API details, see API Quick Reference above
For deployment help, visit: https://vercel.com/docs
