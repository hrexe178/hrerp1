# HR ERP System

A comprehensive, production-ready Human Resources Enterprise Resource Planning (HR ERP) System built with the MERN stack (MongoDB, Express, React, Node.js). This system is designed to streamline HR workflows, manage employee data, track attendance, handle projects, and provide deep analytics through dedicated, role-based, premium glassmorphism dashboards.

---

## 🏗️ Architecture & Technology Stack

- **Frontend:** React.js, React Router v6, Axios, Recharts (for deep analytical charts), modern Vanilla CSS with Glassmorphism UI.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Atlas/Local) via Mongoose.
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs.
- **Utilities:** Node-cron (scheduled jobs), Nodemailer (email notifications), PDFKit (document generation).

---

## ✨ Key Features & Capabilities

### 1. 🔐 Role-Based Access Control (RBAC)
The system supports three primary roles, each unlocking specific UI and API capabilities:
- **Admin**: Full system access, company-wide analytics, manage any employee, override capabilities.
- **HR**: Similar to Admin, focuses on employee onboarding, attendance tracking, and payroll.
- **Manager**: Can view and manage employees specifically under their reporting line, manage assigned projects, and conduct manager-level performance reviews.
- **Employee**: Standard access to their own profile, attendance, leaves, payslips, and self-assessments.

### 2. 📊 Dedicated Premium Dashboards
The application leverages dynamic routing to serve highly customized, modern, translucent "Glassmorphism" dashboards based on the user's role.

#### **Admin Command Center (`/dashboard`)**
- **Company-Wide Metrics**: Real-time stats on total employees, active employees, total projects, and in-progress projects.
- **Monthly Performance Rating Edge Chart**: An interactive line chart displaying the company-wide average performance review ratings over recent months.
- **Quick Monthly Performance Review Widget**: An integrated form allowing Admins to rapidly evaluate an employee, pick a review month, submit a rating (1-5), and finalize the assessment without leaving the dashboard.
- **Upcoming Holidays & Announcements**: Quick views of essential company broadcasts.

#### **Employee Dashboard (`/dashboard`)**
- **Personal Metrics**: Direct entry points to `My Attendance`, `My Leaves`, and `My Payslips`.
- **My Monthly Performance Tracking**: An interactive line chart strictly showing the employee's historical, finalized performance ratings over time.
- **Announcements & Holidays**: Read-only views of company-wide events.

### 3. 👥 Employee Management
- Complete CRUD operations for employee records (Name, Role, Department, Contact, Joining Date, etc.).
- Detailed Employee Profile view including their assigned projects and current line manager.

### 4. 📅 Attendance & Leave Management
- **Daily Attendance Logging**: Employees can mark their attendance; HR/Admins can override or bulk-manage records.
- **Leave Requests**: Employees can request leaves (Sick, Annual, etc.). Managers/HR can approve or reject these requests.

### 5. 🚀 Project Management
- Create projects with Title, Description, Status, Start/End Dates.
- Assign a Manager and a team of Employees to specific projects.
- Track project status (Pending, In Progress, Completed).

### 6. 📝 Performance Reviews (`/performance-reviews`)
A robust 3-stage performance pipeline:
1. **Creation**: Admin/HR creates a review cycle (e.g., YYYY-MM) for an employee.
2. **Self-Assessment**: The employee submits their own evaluation and KPIs.
3. **Manager Review & Completion**: The Manager/Admin provides a rating and finalized assessment, driving the charts on the dashboards.

### 7. 💰 Expense & Payroll Management
- **Expenses**: Employees can log expense requests; Managers/HR approve and process reimbursements.
- **Payroll**: Automated calculation of base salary, allowances, and deductions. Generates downloadable PDF payslips.

### 8. 📄 Document Management
- Employees can upload compliance documents, IDs, or certifications.
- Expiration tracking with automated cron-job email alerts sent 30 days before document expiration.

### 9. ⏰ Shift & Holiday Management
- Define custom working shifts and assign them to employees.
- Maintain a global company Holiday Calendar.

### 10. 📣 Announcements
- Broadcast company-wide alerts that immediately populate on all users' dashboards.

---

## 🗺️ Application Routes (Frontend Pages)

| Route                        | Component                     | Access Level            | Description                                              |
| ---------------------------- | ----------------------------- | ----------------------- | -------------------------------------------------------- |
| `/login`                     | `Login`                       | Public                  | User authentication portal.                              |
| `/dashboard`                 | `Dashboard` (Admin/Employee)  | All                     | Role-based command center with metrics and charts.       |
| `/employees`                 | `EmployeeList`                | Admin, HR, Manager      | Directory of company personnel.                          |
| `/employees/create`          | `EmployeeForm`                | Admin, HR               | Onboard a new employee.                                  |
| `/employees/:id`             | `EmployeeDetails`             | Admin, HR, Manager      | Deep dive into a specific employee's profile.            |
| `/attendance`                | `AttendanceManagement`        | Admin, HR, Manager      | Company-wide or team-wide attendance tracker.            |
| `/projects`                  | `ProjectManagement`           | All                     | View all projects (Employees see assigned projects).     |
| `/documents`                 | `DocumentManager`             | All                     | Upload and manage files and compliance documents.        |
| `/reports`                   | `Reports`                     | Admin, HR               | High-level aggregated data exports.                      |
| `/my-profile`                | `MyProfile`                   | All                     | Update personal info and change password.                |
| `/my-attendance`             | `MyAttendance`                | All                     | Personal attendance history.                             |
| `/my-leaves`                 | `MyLeaves`                    | All                     | Request and track personal time off.                     |
| `/my-payslips`               | `MyPayslips`                  | All                     | View and download PDF salary slips.                      |
| `/expenses`                  | `ExpenseManagement`           | All                     | Submit and approve financial reimbursements.             |
| `/performance-reviews`       | `PerformanceReviewManagement` | All                     | Engage in the performance review lifecycle.              |
| `/shifts`                    | `ShiftManagement`             | Admin, HR               | Configure employee working hours.                        |
| `/announcements`             | `AnnouncementManagement`      | Admin, HR               | Publish news to user dashboards.                         |
| `/holidays`                  | `HolidayManagement`           | Admin, HR               | Manage the company's official time off calendar.         |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (Local or Atlas)
- NPM or Yarn

### 1. Clone & Install Dependencies
First, install the root dependencies, which includes a script to install frontend dependencies simultaneously:

```bash
git clone <repository-url>
cd hrerp1
npm run install-all
```

### 2. Environment Variables
Create a `.env` file in the **root** (`/`) directory based on `.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Frontend Origins allowed by CORS
FRONTEND_URL=http://localhost:3000

# Email configurations (used by Cron jobs for alerts)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=HR ERP <no-reply@example.com>

# Initial Admin Seeding Configuration
ADMIN_EMAIL=admin@hrerp.com
ADMIN_PASSWORD=admin123
```

*(Note: The `frontend/.env` natively handles the proxy to `http://localhost:5000` via `package.json` and standard logic, but you can set `REACT_APP_API_URL` if needed).*

### 3. Seed Initial Admin Account
Run the seeder to construct the first Admin user profile in your database, allowing you to log in initially:

```bash
npm run seed
```
This will output the success message and credentials configured in your `.env`.

### 4. Run the Application
The application uses `concurrently` to run both the Node.js backend server and the React frontend client simultaneously.

```bash
npm run dev
```

- **Frontend Browser URL:** `http://localhost:3000`
- **Backend API URL:** `http://localhost:5000`

Log in using the seeded Admin credentials to begin onboarding employees!
