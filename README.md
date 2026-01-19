# HR ERP System - Complete Production-Ready MERN Stack

A comprehensive Human Resource Management system built with the MERN stack (MongoDB, Express, React, Node.js), featuring JWT authentication, role-based access control, employee management, attendance tracking, project management, and document management.

## 🚀 Quick Start

### Prerequisites
- Node.js v18.x or higher
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd hr-erp-system
```

2. **Install all dependencies**
```bash
npm run install-all
```

3. **Configure environment variables**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A strong random string (min 32 chars recommended)
# - FRONTEND_URL: http://localhost:3000 (for development)
```

4. **Seed the admin user**
```bash
npm run seed
```

5. **Start the development server**
```bash
npm run dev
```

This will start both backend (port 5000) and frontend (port 3000).

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

### Default Admin Credentials
```
Email: admin@hrerp.com
Password: admin123
⚠️ Change password immediately after first login
```

## 📋 Core Features

### ✅ Authentication & Authorization
- JWT-based authentication with 7-day expiration
- Role-based access control (RBAC): Admin, HR, Manager, Employee
- Secure password hashing with bcryptjs
- Protected routes with automatic token refresh

### 👥 Employee Management
- Complete employee profiles with:
  - Personal information (name, contact, address, DOB, gender)
  - Professional details (department, designation, salary, bank details)
  - Skills, education, and experience tracking
  - Performance reviews with ratings (1-5)
  - Document storage (resumes, certifications)
  - Project assignments
- Advanced search and filtering
- Employee statistics by department and type
- Employee status tracking (Active, Inactive, On Leave)

### 📅 Attendance Management
- Daily attendance tracking with timestamps
- Check-in/check-out time recording
- Comprehensive leave management:
  - Multiple leave types (Sick, Casual, Paid, Unpaid, Maternity, Paternity)
  - Leave approval workflow
  - Leave reason tracking
- Location tracking (Office, Remote, Field, Client Site)
- Overtime calculation
- Monthly attendance reports with statistics
- Duplicate entry prevention (unique employee + date constraint)

### 📊 Project Management
- Project lifecycle management:
  - Status: Planning, In Progress, On Hold, Completed, Cancelled
  - Priority: Low, Medium, High, Critical
- Team member allocation with percentage allocation
- Client information management
- Milestone tracking with completion dates
- Risk management with severity levels
- Budget tracking (estimated vs. actual)
- Technology stack documentation
- Progress percentage tracking (0-100%)
- Project tagging and organization

### 📄 Document Management
- Document versioning with automatic version increment
- Multiple document types (Project Document, Employee Document, Contract, Report, Invoice, Policy)
- File type support (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, Image, Video)
- Access control (Public, Private, Restricted)
- Linking to projects and employees
- Expiry date tracking
- Soft-delete functionality (isActive flag)
- File size tracking

### 📈 Reports & Analytics
- Dashboard with key metrics (total employees, active employees, total projects, in-progress projects)
- Employee statistics by department and employment type
- Attendance analytics with status distribution
- Project progress tracking
- Leave analysis
- CSV export functionality for data analysis

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js v18.x
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 7.0.0
- **Authentication**: JWT (jsonwebtoken), bcryptjs 2.4.3
- **Validation**: express-validator 7.0.0
- **CORS**: Configurable per environment
- **Environment**: dotenv

### Frontend
- **Library**: React 18.2.0
- **Router**: React Router 6.20.0
- **HTTP Client**: Axios 1.6.2
- **State Management**: React Context API
- **Styling**: CSS3 with responsive design (Mobile-first)

### Deployment
- **Platform**: Vercel (serverless backend, static frontend)
- **Database**: MongoDB Atlas
- **Environment Configuration**: Vercel environment variables

## 📁 Project Structure

```
hr-erp-system/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection setup
│   ├── middleware/
│   │   ├── auth.js                  # JWT auth & RBAC (protect, admin, adminOrHR)
│   │   └── errorHandler.js          # Centralized error handling
│   ├── models/
│   │   ├── User.js                  # User authentication model
│   │   ├── Employee.js              # Employee with complete profile
│   │   ├── Attendance.js            # Attendance with leave management
│   │   ├── Project.js               # Project with team & milestones
│   │   └── Document.js              # Document with versioning
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/* - login, register, me, logout
│   │   ├── employeeRoutes.js        # /api/employees/* - CRUD, search, stats
│   │   ├── attendanceRoutes.js      # /api/attendance/* - CRUD, reports
│   │   ├── projectRoutes.js         # /api/projects/* - CRUD, team assignment
│   │   └── documentRoutes.js        # /api/documents/* - CRUD, soft-delete
│   ├── server.js                    # Express server with middleware setup
│   └── seed.js                      # Admin user seeding script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx            # Login with error handling
│   │   │   ├── Dashboard.jsx        # Main dashboard with stats
│   │   │   ├── Navbar.jsx           # Navigation with user info
│   │   │   ├── ProtectedRoute.jsx   # Route protection with RBAC
│   │   │   ├── EmployeeList.jsx     # Employee list with filtering
│   │   │   ├── EmployeeForm.jsx     # Create/edit employee form
│   │   │   ├── EmployeeDetails.jsx  # Employee profile view
│   │   │   ├── AttendanceManagement.jsx   # Attendance CRUD & reports
│   │   │   ├── ProjectManagement.jsx      # Project list & management
│   │   │   ├── ProjectDetails.jsx   # Project detail view
│   │   │   ├── DocumentManager.jsx  # Document upload & management
│   │   │   └── Reports.jsx          # Analytics & reports
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state with persistence
│   │   ├── utils/
│   │   │   ├── api.js               # Axios with token injection
│   │   │   └── helpers.js           # 15+ utility functions
│   │   ├── styles/
│   │   │   └── index.css            # Responsive CSS with dark mode support
│   │   ├── App.jsx                  # Main routing component
│   │   └── index.js                 # React entry point
│   └── package.json
├── package.json                     # Root orchestration & scripts
├── vercel.json                      # Vercel deployment config (v2)
├── .env.example                     # Environment variables template
├── SETUP.md                         # Detailed setup & troubleshooting guide
└── README.md                        # This file
```

## 🔐 Authentication & Authorization

### Roles and Permissions

| Role | Employees | Attendance | Projects | Documents | Reports |
|------|-----------|-----------|----------|-----------|---------|
| Admin | Full | Full | Full | Full | Full |
| HR | Full | Full | Full | Full | Full |
| Manager | View/Own | View Own | View Own | View/Upload | View Own |
| Employee | View Own | View Own | View Assigned | View Own | No |

### Authentication Flow
```
1. User enters email/password on Login page
2. POST /api/auth/login → Backend validates credentials
3. Backend generates JWT with 7-day expiration
4. Frontend stores JWT in localStorage
5. Axios request interceptor injects "Authorization: Bearer {token}"
6. Backend middleware verifies JWT on protected routes
7. On 401 response, frontend clears localStorage & redirects to login
```

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
```
POST /api/auth/register          - Register new user
POST /api/auth/login             - Login with email/password
GET  /api/auth/me                - Get current user (protected)
POST /api/auth/logout            - Logout (protected)
```

### Employees (`/api/employees`)
```
GET  /api/employees              - List all (with search/filter)
GET  /api/employees/:id          - Get single employee
POST /api/employees              - Create new (HR/Admin)
PUT  /api/employees/:id          - Update (HR/Admin)
DELETE /api/employees/:id        - Delete (Admin)
GET  /api/employees/stats/summary - Statistics (HR/Admin)
```

### Attendance (`/api/attendance`)
```
GET  /api/attendance             - List records (with filters)
GET  /api/attendance/employee/:employeeId - Employee history
GET  /api/attendance/report/:month/:year  - Monthly report
POST /api/attendance             - Create record (HR/Admin)
PUT  /api/attendance/:id         - Update record (HR/Admin)
DELETE /api/attendance/:id       - Delete record (HR/Admin)
```

### Projects (`/api/projects`)
```
GET  /api/projects               - List projects (with filters)
GET  /api/projects/:id           - Get project details
POST /api/projects               - Create project (HR/Admin)
PUT  /api/projects/:id           - Update project (HR/Admin)
DELETE /api/projects/:id         - Delete project (HR/Admin)
POST /api/projects/:id/assign-employee    - Assign team member
DELETE /api/projects/:id/remove-employee/:employeeId - Remove member
```

### Documents (`/api/documents`)
```
GET  /api/documents              - List documents (with filters)
GET  /api/documents/project/:projectId - Project documents
GET  /api/documents/employee/:employeeId - Employee documents
POST /api/documents              - Upload document
PUT  /api/documents/:id          - Update document
DELETE /api/documents/:id        - Soft-delete document
```

## 📊 Database Schema

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed, not selected by default),
  role: String (enum: admin, hr, manager, employee),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Employee Model
```javascript
{
  employeeId: String (auto-generated: EMP{timestamp}{count}),
  user: ObjectId (ref: User),
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  personalInfo: {
    address: { street, city, state, pin, country },
    dob: Date,
    gender: String,
    emergencyContact: { name, relationship, phone }
  },
  professional: {
    department: String,
    designation: String,
    employmentType: String,
    joiningDate: Date,
    workLocation: String,
    reportingManager: ObjectId (ref: User),
    employmentStatus: String (enum: Active, Inactive, On Leave)
  },
  compensation: {
    salary: Number,
    currency: String,
    paymentFrequency: String,
    bankDetails: { accountNumber, ifsc, bankName }
  },
  documents: [{ name, type, url, uploadDate }],
  skills: [String],
  education: [{ institution, degree, field, year }],
  experience: [{ company, designation, startDate, endDate, description }],
  performanceReviews: [{ date, rating(1-5), comments, reviewedBy }],
  projects: [ObjectId] (ref: Project),
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Model
```javascript
{
  employee: ObjectId (ref: Employee),
  date: Date (unique with employee),
  status: String (enum: Present, Absent, Half-Day, Leave, Holiday, Weekend),
  checkInTime: Date,
  checkOutTime: Date,
  workHours: Number,
  overtimeHours: Number,
  location: String (enum: Office, Remote, Field, Client Site),
  leaveDetails: {
    leaveType: String,
    leaveReason: String,
    approvedBy: ObjectId (ref: User),
    isApproved: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  projectId: String (auto-generated: PRJ{timestamp}{count}),
  name: String,
  description: String,
  client: { name, email, phone, company },
  manager: ObjectId (ref: User),
  teamMembers: [{
    employee: ObjectId (ref: Employee),
    role: String,
    assignedDate: Date,
    allocationPercentage: Number
  }],
  startDate: Date,
  endDate: Date,
  actualEndDate: Date,
  status: String (enum: Planning, In Progress, On Hold, Completed, Cancelled),
  priority: String (enum: Low, Medium, High, Critical),
  budget: { estimated, actual, currency },
  technologyStack: [String],
  progressPercentage: Number (0-100),
  milestones: [{ name, description, dueDate, status, completionDate }],
  risks: [{ description, severity, mitigation, identifiedDate }],
  notes: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Document Model
```javascript
{
  name: String,
  description: String,
  type: String (enum: Project Document, Employee Document, Contract, Report, Invoice, Policy, Other),
  fileUrl: String,
  fileType: String (enum: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, Image, Video, Other),
  fileSize: Number,
  project: ObjectId (ref: Project),
  employee: ObjectId (ref: Employee),
  uploadedBy: ObjectId (ref: User),
  uploadDate: Date,
  version: Number,
  tags: [String],
  accessLevel: String (enum: Public, Private, Restricted),
  expiryDate: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment to Vercel

### Prerequisites
1. GitHub repository with this code
2. Vercel account (connect with GitHub)
3. MongoDB Atlas cluster with connection string

### Step-by-Step Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "HR ERP System v1.0 - Production Ready"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Framework: Select "Other"

3. **Configure Build Settings**
   - Build Command: Leave default (uses vercel.json)
   - Output Directory: Leave default

4. **Set Environment Variables** (Critical!)
   ```
   MONGODB_URI        = mongodb+srv://username:password@cluster.mongodb.net/hrerp
   JWT_SECRET         = generate-a-strong-random-string-32-chars-minimum
   NODE_ENV           = production
   PORT               = (auto, leave empty)
   FRONTEND_URL       = https://your-vercel-url.vercel.app
   ADMIN_EMAIL        = admin@hrerp.com
   ADMIN_PASSWORD     = change-me-after-first-login
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment logs to complete
   - Both backend and frontend will be deployed to Vercel

6. **Post-Deployment**
   - Access your application at the provided Vercel URL
   - Seed admin user if needed (connection string available in logs)
   - Login with admin credentials
   - Change admin password immediately

### Vercel Deployment Configuration

The `vercel.json` file is pre-configured for:
- Backend: Node.js serverless functions under `/api`
- Frontend: Static build served at root
- Automatic rewrites for API routes
- Environment variable management

## 🧪 Testing Your Setup

### Test Login Flow
1. Navigate to frontend (http://localhost:3000)
2. Try to access protected route → redirects to /login
3. Login with admin@hrerp.com / admin123
4. Dashboard loads and token is stored in localStorage

### Test API Endpoint
```bash
# Terminal 1: Start backend (npm run server)
# Terminal 2: 
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrerp.com","password":"admin123"}'

# Response should include token and user object
```

### Test Protected Route
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Should return current user details
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Cannot connect to MongoDB** | Verify MONGODB_URI in .env, ensure MongoDB Atlas IP whitelist includes your IP |
| **JWT verification failed** | Check JWT_SECRET matches between .env and where it's used |
| **CORS errors in browser** | Verify FRONTEND_URL env var matches your frontend origin |
| **401 Unauthorized errors** | Check if token exists in localStorage, try logout/login again |
| **Port already in use** | Linux/Mac: `lsof -ti:5000 \| xargs kill -9` / Windows: `netstat -ano \| findstr :5000` |
| **Module not found errors** | Run `npm run install-all` from project root |
| **Duplicate email error** | Email already exists in database, use different email |
| **Duplicate attendance error** | Attendance record for employee on that date already exists |
| **File upload errors** | Check file size limit (50MB set in express.json middleware) |
| **Performance slow** | Check MongoDB indexes, consider adding caching layer |

## 📝 Environment Variables

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hrerp

# JWT Configuration
JWT_SECRET=your-super-secret-key-minimum-32-characters-recommended
JWT_EXPIRE=7d

# Server Configuration
NODE_ENV=development
PORT=5000

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Admin Seed User
ADMIN_EMAIL=admin@hrerp.com
ADMIN_PASSWORD=admin123
```

## 📚 Key Files & Their Purposes

| File | Purpose |
|------|---------|
| `backend/config/db.js` | MongoDB connection with error handling |
| `backend/middleware/auth.js` | JWT verification and RBAC middleware |
| `backend/middleware/errorHandler.js` | Centralized error handling for all errors |
| `backend/models/*.js` | Mongoose schemas with validation |
| `backend/routes/*.js` | API endpoints with business logic |
| `frontend/src/utils/api.js` | Axios instance with auto-token injection |
| `frontend/src/context/AuthContext.jsx` | Global authentication state |
| `vercel.json` | Vercel deployment configuration |
| `.env.example` | Environment variables template |

## 🎯 Next Steps After Setup

1. **Change Admin Password**
   - Login with admin@hrerp.com / admin123
   - Navigate to settings and change password

2. **Create HR User**
   - As admin, create HR user for HR operations
   - This reduces risk of admin overuse

3. **Set Up Departments**
   - Create your company's departments
   - Set up designation structures

4. **Seed Sample Data**
   - Create sample employees
   - Set up projects
   - Mark sample attendance

5. **Configure Backup**
   - Set up MongoDB Atlas backups
   - Configure automated backups in Vercel

6. **Monitor Performance**
   - Check Vercel analytics
   - Monitor MongoDB connection usage
   - Review error logs regularly

## 📄 License

This project is provided as-is for educational and commercial use.

## 🤝 Support & Contributions

For issues, questions, or contributions, please open an issue in the repository.

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: ✅ Production Ready  
**Deployment Ready**: ✅ Vercel  
**Database Ready**: ✅ MongoDB Atlas  
**Security**: ✅ JWT + RBAC + Validation

# hrerp
