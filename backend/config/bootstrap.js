import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { sampleProducts } from '../data/sampleProducts.js';

// Idempotent: creates the first admin and sample products only when missing.
export async function bootstrapData() {
  if (!process.env.JWT_SECRET) console.warn('JWT_SECRET is not set; login will fail');
  if (!(await User.exists({ role: 'admin' }))) {
    const email = process.env.ADMIN_EMAIL || 'admin@electromart.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
    if (!(await User.exists({ email }))) {
      await User.create({ name: 'Admin', email, password: await bcrypt.hash(password, 10), role: 'admin' });
      console.log(`Created admin ${email}`);
    }
  }
  if ((await Product.estimatedDocumentCount()) === 0) {
    await Product.insertMany(sampleProducts);
    console.log('Inserted sample products');
  }
}
