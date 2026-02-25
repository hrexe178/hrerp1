const Employee = require('../models/Employee');
const User = require('../models/User');
const { logAction } = require('./auditService');
const { sendEmail } = require('./emailService');

const createEmployee = async (employeeData, req) => {
    let employeeId;
    let isUnique = false;
    while (!isUnique) {
        const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        employeeId = `EMP2600${randomNumber}`;
        const existingEmployee = await Employee.findOne({ employeeId });
        if (!existingEmployee) {
            isUnique = true;
        }
    }
    employeeData.employeeId = employeeId;

    let role = 'employee';
    if (employeeData.position === 'HR Executive' || employeeData.position === 'HR') role = 'hr';
    if (employeeData.position === 'Manager') role = 'manager';

    const tempPassword = `${employeeData.firstName.toLowerCase().replace(/\s/g, '')}@123`;

    const newUser = await User.create({
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        password: tempPassword,
        role,
    });

    employeeData.user = newUser._id;
    const credentials = { email: employeeData.email, tempPassword, role, position: employeeData.position };

    await logAction(req, 'CREATE', 'User', newUser._id, null, { email: newUser.email, role: newUser.role }, newUser.email);

    const employee = await Employee.create(employeeData);
    await employee.populate('user', 'firstName lastName email role');
    await employee.populate('reportingManager', 'firstName lastName employeeId');

    await logAction(req, 'CREATE', 'Employee', employee._id, null, employee.toObject(), employee.employeeId);

    await sendEmail(credentials.email, 'welcome', [
        employee.firstName,
        credentials.email,
        credentials.tempPassword,
        credentials.role,
    ]);

    const publicCredentials = { email: credentials.email, role: credentials.role, position: credentials.position };
    return { employee, credentials: publicCredentials };
};

const getAllEmployees = async (query = {}, options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const employees = await Employee.find(query)
        .populate('user', 'firstName lastName email role')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    const count = await Employee.countDocuments(query);
    return { employees, count, totalPages: Math.ceil(count / limit), currentPage: page };
};

module.exports = {
    createEmployee,
    getAllEmployees,
};
