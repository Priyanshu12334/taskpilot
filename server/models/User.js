const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User Schema fields
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Do not return the password by default in queries
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'simpleUser', 'Member', 'Admin', 'Pending', 'Rejected'], // Keeping old for migration compatibility
    default: 'simpleUser',
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active',
  },
  purpose: {
    type: String,
    default: '',
    trim: true,
  },
  canAccessChat: {
    type: Boolean,
    default: false,
  },
}, { 
  timestamps: true // Automatically create 'createdAt' and 'updatedAt' fields
});

// Hash the password before saving a new or modified user
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  // Generate a salt with 10 rounds
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify passwords during login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
