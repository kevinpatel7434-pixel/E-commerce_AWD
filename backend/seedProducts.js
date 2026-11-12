import 'dotenv/config';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';
await connectDB();
import { sampleProducts as products } from './data/sampleProducts.js';
await Product.deleteMany({}); await Product.insertMany(products); console.log('Sample products inserted'); process.exit(0);
