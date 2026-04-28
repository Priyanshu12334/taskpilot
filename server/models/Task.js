const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // References our User model so each task is tied to the creator
  },
  title: {
    type: String,
    required: [true, 'Please add a task title'],
  },
  description: {
    type: String,
    // Description is optional
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
  },
  dueDate: {
    type: Date,
  },
  activityLog: [
    {
      action: { type: String, required: true },
      user: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);
