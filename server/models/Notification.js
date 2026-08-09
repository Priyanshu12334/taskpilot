const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['assignment', 'status_update', 'general', 'registration', 'contact'],
    default: 'assignment',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  contactMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContactMessage',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
