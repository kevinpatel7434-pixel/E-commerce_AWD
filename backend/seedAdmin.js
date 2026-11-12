import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/User.js';

await connectDB();
const email = process.env.ADMIN_EMAIL || 'admin@electromart.com';
const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
const existing = await User.findOne({ email });
if (existing) { existing.role = 'admin'; existing.password = await bcrypt.hash(password, 10); await existing.save(); }
else await User.create({ name: 'Admin', email, password: await bcrypt.hash(password, 10), role: 'admin' });
console.log(`Admin ready: ${email}`); process.exit(0);
