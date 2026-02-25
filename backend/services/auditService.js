const AuditLog = require('../models/AuditLog');

const logAction = async (req, action, moduleName, targetId, previousValue = null, newValue = null, targetName = '') => {
  try {
    await AuditLog.create({
      action,
      module: moduleName,
      targetId,
      targetName,
      performedBy: req?.user?.id,
      previousValue,
      newValue,
      ipAddress: req?.ip || req?.headers['x-forwarded-for'] || '',
      userAgent: req?.headers['user-agent'] || '',
    });
  } catch (error) {
    // Audit failures must never block primary API flows.
    console.error('Audit log failed:', error.message);
  }
};

module.exports = { logAction };
