import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/admin.model.js';
import config from '../config/config.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@stepstamps.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await Admin.create({
      name: 'StepStamps Admin',
      email: 'admin@stepstamps.com',
      password: hashedPassword,
      isActive: true,
    });

    console.log('Admin created successfully!');
    console.log('Admin credentials:');
    console.log('Email: admin@stepstamps.com');
    console.log('Password: Admin@123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin(); 