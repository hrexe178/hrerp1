const nodemailer = require('nodemailer');

const hasSmtpConfig = Boolean(
  process.env.EMAIL_HOST &&
  process.env.EMAIL_PORT &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

const templates = {
  welcome: (name, email, password, role) => ({
    subject: 'Welcome - Your Login Credentials',
    html: `<h2>Welcome, ${name}!</h2><p><b>Email:</b> ${email}</p><p><b>Password:</b> ${password}</p><p><b>Role:</b> ${role}</p><p>Please change your password after first login.</p>`,
  }),
  projectAssigned: (name, project, role) => ({
    subject: `Assigned to Project: ${project}`,
    html: `<h3>Hi ${name},</h3><p>You have been assigned to <b>${project}</b> as <b>${role}</b>.</p>`,
  }),
  leaveStatusUpdate: (name, status, fromDate, toDate) => ({
    subject: `Leave Request ${status}`,
    html: `<h3>Hi ${name},</h3><p>Your leave from ${fromDate} to ${toDate} has been <b>${status}</b>.</p>`,
  }),
  attendanceAlert: (name, days) => ({
    subject: `Attendance Alert - ${days} Days Absent`,
    html: `<h3>Dear ${name},</h3><p>You have ${days} consecutive absences. Please contact HR.</p>`,
  }),
  documentUploaded: (name, docName) => ({
    subject: `New Document: ${docName}`,
    html: `<h3>Hi ${name},</h3><p>Document <b>${docName}</b> was added to your profile.</p>`,
  }),
  documentExpiryAlert: (name, details) => ({
    subject: 'Document Expiry Alert',
    html: `<h3>Hi ${name},</h3><p>${details}</p>`,
  }),
  payslipReady: (name, month, year, payslipUrl) => ({
    subject: `Payslip Ready - ${month} ${year}`,
    html: `<h3>Hi ${name},</h3><p>Your payslip for ${month} ${year} is available in the portal.</p>${payslipUrl ? `<p><a href="${payslipUrl}">Download Payslip</a></p>` : ''}`,
  }),
  announcementPublished: (name, title) => ({
    subject: `New Announcement: ${title}`,
    html: `<h3>Hi ${name},</h3><p>A new announcement titled <b>${title}</b> was published.</p>`,
  }),
  performanceReviewStatus: (name, cycle, status) => ({
    subject: `Performance Review ${status}: ${cycle}`,
    html: `<h3>Hi ${name},</h3><p>Your performance review cycle <b>${cycle}</b> is now in <b>${status}</b> state.</p>`,
  }),
};

const sendEmail = async (to, templateName, args) => {
  try {
    if (!transporter) {
      return;
    }

    if (!to || !templates[templateName]) {
      return;
    }

    const template = templates[templateName](...(args || []));
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: template.subject,
      html: template.html,
    });
  } catch (error) {
    // Email errors should not break business operations.
    console.error('Email failed:', error.message);
  }
};

module.exports = { sendEmail };
