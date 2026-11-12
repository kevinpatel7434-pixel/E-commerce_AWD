import Order from '../models/Order.js';

// Sales summary for the admin dashboard (like PHP api/summary.php)
export async function getSummary(req, res) {
  try {
    const [result] = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } }
    ]);
    res.json({ revenue: result?.revenue || 0, orders: result?.orders || 0 });
  } catch (e) { res.status(500).json({ message: e.message }); }
}

// Top selling products by quantity sold (like PHP api/top_products.php)
export async function getTopProducts(req, res) {
  try {
    const rows = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', qty: { $sum: '$items.quantity' } } },
      { $sort: { qty: -1 } },
      { $limit: 8 }
    ]);
    res.json({ labels: rows.map((row) => row._id), values: rows.map((row) => row.qty) });
  } catch (e) { res.status(500).json({ message: e.message }); }
}
