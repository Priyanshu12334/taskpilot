require('dotenv').config({ path: require('path').join(process.cwd(), '.env'), quiet: true });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    const users = await User.find({ role: { $in: ['admin', 'Admin', 'member', 'Member'] }, status: { $ne: 'blocked' } }).select('_id role').lean();
    const selected = ['admin', 'member'].map(role => users.find(user => user.role.toLowerCase() === role));
    for (const [index, user] of selected.entries()) {
      if (!user) { console.log(`${index === 0 ? 'admin' : 'member'}: no active test account found`); continue; }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2m' });
      const response = await fetch('http://localhost:5000/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json().catch(() => null);
      console.log(`${index === 0 ? 'admin' : 'member'}: HTTP ${response.status}; ${Array.isArray(body) ? `array(${body.length})` : JSON.stringify({ message: body?.message })}`);
    }
  } catch (error) { console.log(`diagnostic failed: ${error.name}`); }
  finally { await mongoose.disconnect().catch(() => {}); }
})();
