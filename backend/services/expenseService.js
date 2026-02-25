const Expense = require('../models/Expense');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { logAction } = require('./auditService');

/**
 * Service to handle expense related business logic
 */
const expenseService = {
    /**
     * Submit a new expense
     */
    submitExpense: async (userId, expenseData) => {
        const employee = await Employee.findOne({ user: userId });
        if (!employee) throw new Error('Employee profile not found');

        const expense = await Expense.create({
            employee: employee._id,
            ...expenseData
        });

        return expense.populate('employee', 'firstName lastName employeeId department');
    },

    /**
     * Process manager or HR action on expense
     */
    processAction: async (req, expenseId, action, remarks) => {
        const expense = await Expense.findById(expenseId).populate('employee', 'employeeId user');
        if (!expense) throw new Error('Expense not found');

        const isManager = req.user.role === 'manager';
        const isHR = req.user.role === 'hr' || req.user.role === 'admin';
        const previous = expense.toObject();

        if (action === 'approve') {
            if (isManager && !isHR) {
                if (expense.status !== 'Pending') throw new Error('Already processed');
                expense.status = 'Manager Approved';
                expense.managerReviewedBy = req.user.id;
                expense.managerReviewedOn = new Date();
                expense.managerReviewRemarks = remarks || '';
            } else if (isHR) {
                expense.status = 'Approved';
                expense.approvedBy = req.user.id;
                expense.reviewedOn = new Date();
                expense.reviewRemarks = remarks || expense.reviewRemarks || '';
            }
        } else if (action === 'reject') {
            expense.status = 'Rejected';
            expense.approvedBy = req.user.id;
            expense.reviewedOn = new Date();
            expense.reviewRemarks = remarks || '';
        } else if (action === 'pay') {
            if (!isHR) throw new Error('Only HR can mark as paid');
            expense.status = 'Paid';
            expense.paymentDate = new Date();
        }

        await expense.save();

        // Trigger notification if enabled
        if (expense.employee?.user) {
            await Notification.create({
                recipient: expense.employee.user,
                title: `Expense Status: ${expense.status}`,
                message: `Your expense for ${expense.category} has been updated to ${expense.status}.`,
                type: expense.status === 'Rejected' ? 'error' : 'info',
                link: '/expenses'
            });
        }

        await logAction(req, action.toUpperCase(), 'Expense', expense._id, previous, expense.toObject(), expense.employee?.employeeId || '');
        return expense;
    }
};

module.exports = expenseService;
