const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const resetPasswords = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users. Resetting passwords...`);

        for (const user of users) {
            // Keep admin password as 'admin123' if it's the main admin? 
            // Better to follow user instruction "for all"
            const newPassword = `${user.firstName.toLowerCase().replace(/\s/g, '')}@123`;
            user.password = newPassword;
            await user.save();
            console.log(`Reset password for: ${user.email} -> ${newPassword}`);
        }

        console.log('All passwords reset successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting passwords:', error);
        process.exit(1);
    }
};

resetPasswords();
