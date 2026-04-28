const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Task = require('../models/Task');

const fixStatusCasing = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all tasks with variations of "In Progress"
    const tasks = await Task.find({
      status: { $regex: /^in progress$/i }
    });

    console.log(`Found ${tasks.length} tasks with status matching "in progress" (case-insensitive)`);

    let updatedCount = 0;
    for (const task of tasks) {
      if (task.status !== 'In Progress') {
        const oldStatus = task.status;
        task.status = 'In Progress';
        await task.save();
        console.log(`Updated task ${task._id}: "${oldStatus}" -> "In Progress"`);
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} tasks.`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing status casing:', error);
    process.exit(1);
  }
};

fixStatusCasing();
