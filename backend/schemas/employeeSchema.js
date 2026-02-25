const { z } = require('zod');

const employeeSchema = z.object({
    body: z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Invalid email address'),
        position: z.string().min(1, 'Position is required'),
        joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        department: z.string().optional(),
        designation: z.string().optional(),
        salary: z.coerce.number().optional(),
    }).passthrough(),
});

module.exports = { employeeSchema };
