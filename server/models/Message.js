const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  }
}, { 
  timestamps: true 
});

messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
