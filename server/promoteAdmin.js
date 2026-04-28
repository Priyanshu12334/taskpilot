const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

async function promoteToAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-app');
    console.log('✅ Connected to MongoDB');

    const result = await User.updateMany({}, { role: 'Admin' });
    console.log(`✅ Promoted ${result.modifiedCount} user(s) to Admin role`);

    const users = await User.find({});
    users.forEach(u => {
      console.log(`   → ${u.name} (${u.email}) is now: ${u.role}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

promoteToAdmin();
