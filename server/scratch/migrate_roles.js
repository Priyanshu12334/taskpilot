const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User'); // Adjust path as needed

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for migration...');

    const users = await User.find({});
    let updatedCount = 0;

    for (const user of users) {
      let roleChanged = false;
      let statusChanged = false;

      // Handle Legacy Roles
      const currentRole = user.role;
      
      if (['Pending', 'pending'].includes(currentRole)) {
        user.role = 'simpleUser';
        user.status = 'active';
        roleChanged = true;
        statusChanged = true;
      } else if (['Rejected', 'rejected'].includes(currentRole)) {
        user.role = 'simpleUser';
        user.status = 'blocked';
        roleChanged = true;
        statusChanged = true;
      } else if (['Member', 'member'].includes(currentRole)) {
        user.role = 'member';
        user.status = 'active';
        roleChanged = true;
        statusChanged = true;
      } else if (['Admin', 'admin'].includes(currentRole)) {
        user.role = 'admin';
        user.status = 'active';
        roleChanged = true;
        statusChanged = true;
      }

      // Ensure status is set for everyone else
      if (!user.status) {
        user.status = 'active';
        statusChanged = true;
      }

      if (roleChanged || statusChanged) {
        await user.save();
        updatedCount++;
      }
    }

    console.log(`Migration completed successfully. Updated ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateRoles();
