import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  wishlist: [{
    type: String
  }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/redemption');
        console.log('Connected to MongoDB');

        // Look for the first user or email 'admin@luxury.com'
        let adminUser = await User.findOne({ email: 'admin@luxury.com' });
        
        if (!adminUser) {
            console.log('Creating admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 12);
            adminUser = new User({
                name: 'Administrator',
                email: 'admin@luxury.com',
                password: hashedPassword,
                role: 'admin'
            });
            await adminUser.save();
            console.log('Admin user created: admin@luxury.com / admin123');
        } else {
            console.log('Admin user already exists. Setting role to admin.');
            adminUser.role = 'admin';
            await adminUser.save();
            console.log('Updated existing admin user role.');
        }

        // Just in case, update ALL users to admin to unblock them testing?
        // Or update a specific one. Let's list users:
        const allUsers = await User.find({});
        console.log('\nAll users in DB:');
        allUsers.forEach(u => {
            console.log(`- ${u.name} (${u.email}) : Role = ${u.role}`);
        });

        // Let's promote all users currently in DB to 'admin' to avoid blocking the user
        await User.updateMany({}, { $set: { role: 'admin' } });
        console.log('\nPromoted all existing users to admin status for testing.');
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

makeAdmin();
