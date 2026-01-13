import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from api folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User from '../models/user';

async function createAdmin() {
  try {
    const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
      throw new Error('DB_URL not found in environment');
    }
    
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('s312392s', 10);
    
    const user = await User.findOneAndUpdate(
      { email: 'stevans93@gmail.com' },
      {
        firstName: 'Stevan',
        lastName: 'Stevanovic',
        email: 'stevans93@gmail.com',
        password: hashedPassword,
        role: 'admin',
      },
      { upsert: true, new: true }
    );

    console.log('✅ Admin user created/updated successfully!');
    console.log('Email:', user.email);
    console.log('Name:', user.firstName, user.lastName);
    console.log('Role:', user.role);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
