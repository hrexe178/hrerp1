const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const currency = (value) => {
  const number = Number(value || 0);
  return number.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const writeSection = (doc, title, lines) => {
  doc.fontSize(12).text(title, { underline: true });
  doc.moveDown(0.4);
  lines.forEach((line) => {
    doc.fontSize(10).text(line);
  });
  doc.moveDown(0.8);
};

const generatePayslipPdf = async ({ payroll, employee }) => {
  const outputDir = path.join(__dirname, '..', 'generated-payslips');
  ensureDir(outputDir);

  const filename = `payslip-${employee.employeeId}-${payroll.year}-${payroll.month}.pdf`;
  const filepath = path.join(outputDir, filename);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    doc.fontSize(18).text('HR ERP - Payslip', { align: 'center' });
    doc.moveDown(0.8);
    doc.fontSize(11).text(`Employee: ${employee.firstName} ${employee.lastName}`);
    doc.text(`Employee ID: ${employee.employeeId}`);
    doc.text(`Month/Year: ${payroll.month}/${payroll.year}`);
    doc.text(`Department: ${employee.department || '-'}`);
    doc.moveDown(1);

    writeSection(doc, 'Earnings', [
      `Basic Salary: INR ${currency(payroll.basicSalary)}`,
      `HRA: INR ${currency(payroll.allowances?.hra)}`,
      `TA: INR ${currency(payroll.allowances?.ta)}`,
      `DA: INR ${currency(payroll.allowances?.da)}`,
      `Medical: INR ${currency(payroll.allowances?.medical)}`,
      `Other: INR ${currency(payroll.allowances?.other)}`,
      `Gross Salary: INR ${currency(payroll.grossSalary)}`,
    ]);

    writeSection(doc, 'Deductions', [
      `PF: INR ${currency(payroll.deductions?.pf)}`,
      `ESI: INR ${currency(payroll.deductions?.esi)}`,
      `TDS: INR ${currency(payroll.deductions?.tds)}`,
      `Loans: INR ${currency(payroll.deductions?.loans)}`,
      `Other: INR ${currency(payroll.deductions?.other)}`,
    ]);

    writeSection(doc, 'Attendance Summary', [
      `Working Days: ${payroll.workingDays || 0}`,
      `Present Days: ${payroll.presentDays || 0}`,
      `Leave Days: ${payroll.leaveDays || 0}`,
    ]);

    doc.fontSize(12).text(`Net Salary: INR ${currency(payroll.netSalary)}`, { align: 'right' });
    doc.moveDown(1);
    doc.fontSize(9).fillColor('#666').text('This is a system-generated payslip.', { align: 'center' });
    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return { filepath, filename };
};

module.exports = { generatePayslipPdf };
