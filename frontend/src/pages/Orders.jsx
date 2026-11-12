import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { getProductImageUrl } from '../utils/productImage';

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders/mine')
      .then((response) => setOrders(response.data))
      .catch(() => setError('We could not load your orders. Please refresh and try again.'));
  }, []);

  return (
    <>
      <Navbar />
      <main className="orders-page">
        <header className="orders-heading">
          <div>
            <p className="eyebrow">YOUR ACCOUNT</p>
            <h1>My orders</h1>
            <p>Track your purchases and revisit your order details.</p>
          </div>
          <Link className="continue-shopping" to="/">Continue shopping -&gt;</Link>
        </header>

        {error && <p className="error orders-message">{error}</p>}

        {!error && orders.length > 0 && (
          <section className="orders-list" aria-label="Your orders">
            {orders.map((order) => (
              <article className="order-card" key={order._id}>
                <div className="order-card-heading">
                  <div>
                    <p className="order-label">ORDER #{order._id.slice(-8).toUpperCase()}</p>
                    <h2>Placed on {formatDate(order.createdAt)}</h2>
                  </div>
                  <span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
                <div className="order-items">
                  {order.items.map((item) => (
                    <div className="order-item" key={`${order._id}-${item.product}`}>
                      <img src={getProductImageUrl(item.image)} alt={item.name} />
                      <div><strong>{item.name}</strong><span>Qty {item.quantity} · ₹{item.price.toLocaleString('en-IN')} each</span></div>
                      <b>₹{(item.price * item.quantity).toLocaleString('en-IN')}</b>
                    </div>
                  ))}
                </div>
                <div className="order-card-footer">
                  <div className="order-delivery"><span>Delivering to</span><strong>{order.shippingAddress?.fullName}</strong><span>{[order.shippingAddress?.address, order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.pincode].filter(Boolean).join(', ') || 'Saved address'}</span><span>{order.shippingAddress?.phone}</span></div>
                  <div className="order-payment"><span>Payment</span><strong>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</strong></div>
                  <div className="order-total"><span>Total</span><strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong></div>
                </div>
              </article>
            ))}
          </section>
        )}

        {!error && !orders.length && (
          <section className="orders-empty">
            <span className="orders-empty-icon" aria-hidden="true">#</span>
            <p className="eyebrow">NOTHING HERE YET</p>
            <h2>Your order history is empty.</h2>
            <p>Find something useful for your everyday and it will show up here.</p>
            <Link className="cart-primary-button" to="/">Browse products <span aria-hidden="true">-&gt;</span></Link>
          </section>
        )}
      </main>
    </>
  );
}
