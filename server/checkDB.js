const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-app');
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log('\n--- USERS ---');
    users.forEach(u => {
      console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });

    const tasks = await Task.find({}).populate('assignedTo', 'name');
    console.log('\n--- TASKS ---');
    tasks.forEach(t => {
      console.log(`ID: ${t._id}, Title: ${t.title}, Creator: ${t.user}, AssignedTo: ${t.assignedTo ? t.assignedTo.name : 'Unassigned'}, Status: ${t.status}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDB();
