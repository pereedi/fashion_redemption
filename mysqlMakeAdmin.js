import db from './server/config/db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const makeAdmin = async () => {
  const email = process.argv[2] || 'admin@redemption.com';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Admin User';

  try {
    console.log(`Checking for user with email: ${email}...`);
    
    const user = await db('users').where({ email }).first();
    const hashedPassword = await bcrypt.hash(password, 12);

    if (user) {
      console.log('User found. Updating role to admin and resetting password...');
      await db('users')
        .where({ email })
        .update({ 
          role: 'admin',
          password: hashedPassword,
          name: name
        });
      console.log('User updated successfully.');
    } else {
      console.log('User not found. Creating new admin user...');
      await db('users').insert({
        name,
        email,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err.message);
    process.exit(1);
  }
};

makeAdmin();
