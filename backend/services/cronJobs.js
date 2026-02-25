const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const Document = require('../models/Document');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { sendEmail } = require('./emailService');

const startCronJobs = () => {
  // Weekdays at 09:00 - notify employee for 3 consecutive absences.
  cron.schedule('0 9 * * 1-5', async () => {
    try {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 2);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const absentRecords = await Attendance.find({
        status: 'Absent',
        date: { $gte: start, $lte: end },
      }).populate('employee');

      const absentCount = {};
      absentRecords.forEach((row) => {
        const employeeId = row.employee?._id?.toString();
        if (!employeeId) return;
        absentCount[employeeId] = (absentCount[employeeId] || 0) + 1;
      });

      const employeeIds = Object.keys(absentCount).filter((id) => absentCount[id] >= 3);
      if (employeeIds.length === 0) return;

      const employees = await Employee.find({ _id: { $in: employeeIds } }).populate('user', 'email firstName');
      for (const employee of employees) {
        if (employee.user?.email) {
          await sendEmail(employee.user.email, 'attendanceAlert', [
            employee.firstName || employee.user.firstName || 'Employee',
            3,
          ]);
        }
      }
    } catch (error) {
      console.error('Attendance cron failed:', error.message);
    }
  });

  // Daily at 08:00 - notify HR/admin for documents expiring in 30 days.
  cron.schedule('0 8 * * *', async () => {
    try {
      const now = new Date();
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);

      const expiringDocs = await Document.find({
        isActive: true,
        expiryDate: { $gte: now, $lte: in30Days },
      })
        .populate('employee', 'firstName lastName')
        .limit(100);

      if (expiringDocs.length === 0) return;

      const hrUsers = await User.find({ role: { $in: ['admin', 'hr'] }, isActive: true }).select('email firstName');
      for (const hr of hrUsers) {
        if (!hr.email) continue;
        await sendEmail(hr.email, 'documentExpiryAlert', [
          hr.firstName || 'HR',
          `${expiringDocs.length} document(s) expiring in next 30 days`,
        ]);
      }
    } catch (error) {
      console.error('Document expiry cron failed:', error.message);
    }
  });
};

module.exports = { startCronJobs };
