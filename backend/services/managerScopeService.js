const Employee = require('../models/Employee');

const canUserManageEmployee = async (user, targetEmployeeId) => {
  if (!user || !targetEmployeeId) return false;
  if (user.role === 'admin' || user.role === 'hr') return true;
  if (user.role !== 'manager') return false;

  const managerEmployee = await Employee.findOne({ user: user.id }).select('_id');
  if (!managerEmployee) return false;

  const targetEmployee = await Employee.findById(targetEmployeeId).select('reportingManager');
  if (!targetEmployee || !targetEmployee.reportingManager) return false;

  return targetEmployee.reportingManager.toString() === managerEmployee._id.toString();
};

const getManagerScopedEmployeeIds = async (user) => {
  if (!user || user.role !== 'manager') return null;
  const managerEmployee = await Employee.findOne({ user: user.id }).select('_id');
  if (!managerEmployee) return [];
  const employees = await Employee.find({ reportingManager: managerEmployee._id }).select('_id');
  return employees.map((row) => row._id);
};

module.exports = { canUserManageEmployee, getManagerScopedEmployeeIds };
