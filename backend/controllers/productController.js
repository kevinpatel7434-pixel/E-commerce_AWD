import Product from '../models/Product.js';

export async function getProducts(req, res) {
  try {
    const { q, category, min, max, sort } = req.query;
    const filter = { active: { $ne: false }, stock: { $gt: 0 } };
    if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { brand: { $regex: q, $options: 'i' } }, { category: { $regex: q, $options: 'i' } }];
    if (category && category !== 'All') filter.category = category;
    if (min || max) filter.price = { ...(min ? { $gte: Number(min) } : {}), ...(max ? { $lte: Number(max) } : {}) };
    let query = Product.find(filter);
    if (sort === 'price-asc') query = query.sort({ price: 1 });
    if (sort === 'price-desc') query = query.sort({ price: -1 });
    if (sort === 'newest') query = query.sort({ createdAt: -1 });
    res.json(await query);
  } catch (e) { res.status(500).json({ message: e.message }); }
}
export async function getCategories(req, res) { res.json(await Product.distinct('category', { active: { $ne: false }, stock: { $gt: 0 } })); }
export async function getProduct(req, res) {
  const p = await Product.findOne({ _id: req.params.id, active: { $ne: false }, stock: { $gt: 0 } });
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
}
export async function getAllProductsAdmin(req, res) {
  try {
    res.json(await Product.find().sort({ createdAt: -1 }));
  } catch (e) { res.status(500).json({ message: e.message }); }
}
export async function setProductActive(req, res) {
  try {
    const active = Boolean(req.body.active);
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    if (active && p.stock <= 0) return res.status(400).json({ message: 'A product must have stock before it can be activated.' });
    p.active = active;
    await p.save();
    res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
}
export async function createProduct(req, res) {
  const price = Number(req.body.price);
  const stock = Number(req.body.stock);
  if (!Number.isFinite(price) || price <= 0 || price > Number.MAX_SAFE_INTEGER) {
    res.status(400).json({ message: 'Price must be greater than 0.' });
    return;
  }
  if (!Number.isSafeInteger(stock) || stock <= 0) {
    res.status(400).json({ message: 'Stock must be a positive whole number.' });
    return;
  }
  try {
    const productData = { ...req.body };
    if (req.file) productData.image = `/uploads/products/${req.file.filename}`;
    res.status(201).json(await Product.create(productData));
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      res.status(400).json({ message: error.message });
      return;
    }
    throw error;
  }
}
export async function updateProduct(req, res) {
  try {
    const productData = { ...req.body };
    if (Number(productData.stock) === 0) productData.active = false;
    if (req.file) productData.image = `/uploads/products/${req.file.filename}`;
    const p = await Product.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      res.status(400).json({ message: error.message });
      return;
    }
    throw error;
  }
}
