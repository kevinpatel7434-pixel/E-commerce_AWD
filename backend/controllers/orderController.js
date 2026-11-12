import Order from '../models/Order.js';
import Product from '../models/Product.js';

export async function createOrder(req, res) {
  const { items, shippingAddress, paymentMethod = 'COD' } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Cart is empty' });
  const changed = [];
  try {
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const qty = Number(item.quantity);
      if (!qty || qty < 1) throw new Error('Invalid quantity');
      const product = await Product.findOneAndUpdate(
        { _id: item.product, active: { $ne: false }, stock: { $gte: qty } },
        [
          { $set: { stock: { $subtract: ['$stock', qty] } } },
          { $set: { active: { $cond: [{ $eq: ['$stock', 0] }, false, '$active'] } } }
        ],
        { new: true }
      );
      if (!product) throw new Error('Product unavailable or insufficient stock');
      changed.push({ id: product._id, qty, depleted: product.stock === 0 });
      totalAmount += product.price * qty;
      orderItems.push({ product: product._id, name: product.name, image: product.image, price: product.price, quantity: qty });
    }
    const order = await Order.create({ user: req.user._id, items: orderItems, totalAmount, shippingAddress, paymentMethod });
    res.status(201).json(order);
  } catch (e) {
    for (const x of changed) {
      const update = { $inc: { stock: x.qty } };
      if (x.depleted) update.$set = { active: true };
      await Product.findByIdAndUpdate(x.id, update);
    }
    res.status(400).json({ message: e.message });
  }
}
export async function myOrders(req, res) { res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); }
export async function allOrders(req, res) { res.json(await Order.find().populate('user', 'name email role').sort({ createdAt: -1 })); }
const statusFlow = ['Placed', 'Processing', 'Shipped', 'Delivered'];
export async function updateOrderStatus(req, res) {
  const next = req.body.status;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status === 'Delivered' || order.status === 'Cancelled') {
    return res.status(400).json({ message: `Order is already ${order.status.toLowerCase()} and cannot be changed.` });
  }
  const forward = statusFlow.includes(next) && statusFlow.indexOf(next) > statusFlow.indexOf(order.status);
  if (next !== order.status && next !== 'Cancelled' && !forward) {
    return res.status(400).json({ message: 'Order status can only move forward, never back.' });
  }
  order.status = next;
  await order.save();
  res.json(order);
}
