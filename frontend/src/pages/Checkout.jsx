import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { getProductImageUrl } from '../utils/productImage';

const initialForm = { fullName: '', phone: '', address: '', city: '', state: 'Gujarat', pincode: '' };

export default function Checkout() {
    const { items, removeMany } = useCart();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const selectedItemIds = location.state?.selectedItemIds;
    const orderItems = Array.isArray(selectedItemIds)
        ? items.filter((item) => selectedItemIds.includes(item._id))
        : items;
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [autofillError, setAutofillError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;

        let isCurrent = true;

        api.get('/orders/mine').then(({ data }) => {
            if (!isCurrent) return;
            const savedAddress = data.find((order) => order.shippingAddress)?.shippingAddress;

            setForm((current) => ({
                ...current,
                fullName: current.fullName || savedAddress?.fullName || user.name || '',
                phone: current.phone || savedAddress?.phone || '',
                address: current.address || savedAddress?.address || '',
                city: current.city || savedAddress?.city || '',
                state: current.state === initialForm.state ? savedAddress?.state || current.state : current.state,
                pincode: current.pincode || savedAddress?.pincode || ''
            }));
        }).catch(() => {
            if (!isCurrent) return;
            setForm((current) => ({ ...current, fullName: current.fullName || user.name || '' }));
            setAutofillError('We could not load your previous delivery details. You can enter them manually.');
        });

        return () => { isCurrent = false; };
    }, [user]);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await api.post('/orders', {
                items: orderItems.map((item) => ({ product: item._id, quantity: item.quantity })),
                shippingAddress: form,
                paymentMethod: 'COD'
            });
            removeMany(orderItems.map((item) => item._id));
            navigate('/orders');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'We could not place your order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="checkout-page">
                <div className="checkout-heading">
                    <div>
                        <p className="eyebrow">SECURE CHECKOUT</p>
                        <h1>Complete your order</h1>
                        <p>Almost there. Add your delivery details below.</p>
                    </div>
                    <Link className="continue-shopping" to="/cart">&lt;- Back to cart</Link>
                </div>

                <div className="checkout-layout">
                    <form className="checkout checkout-form" onSubmit={submit}>
                        <section className="checkout-section">
                            <div className="checkout-section-heading"><span>1</span><div><h2>Contact details</h2><p>We will use these details for delivery updates.</p></div></div>
                            <div className="checkout-fields">
                                <label>Full name<input name="fullName" value={form.fullName} onChange={updateField} placeholder="e.g. Priya Patel" required /></label>
                                <label>Phone number<input name="phone" type="tel" pattern="[0-9]{10}" value={form.phone} onChange={updateField} placeholder="10-digit mobile number" required /></label>
                            </div>
                        </section>

                        <section className="checkout-section">
                            <div className="checkout-section-heading"><span>2</span><div><h2>Delivery address</h2><p>Where should we send your order?</p></div></div>
                            <div className="checkout-fields">
                                <label className="field-wide">Street address<textarea name="address" value={form.address} onChange={updateField} placeholder="House number, street and area" rows="3" required /></label>
                                <label>City<input name="city" value={form.city} onChange={updateField} placeholder="Your city" required /></label>
                                <label>State<select name="state" value={form.state} onChange={updateField} required><option>Gujarat</option><option>Maharashtra</option><option>Rajasthan</option><option>Other</option></select></label>
                                <label>Pincode<input name="pincode" inputMode="numeric" pattern="[0-9]{6}" value={form.pincode} onChange={updateField} placeholder="6-digit pincode" required /></label>
                            </div>
                        </section>

                        <section className="checkout-section">
                            <div className="checkout-section-heading"><span>3</span><div><h2>Payment method</h2><p>Simple and secure payment at your door.</p></div></div>
                            <label className="payment-option"><input type="radio" name="paymentMethod" value="COD" defaultChecked /><span><strong>Cash on Delivery</strong><small>Pay when your order arrives</small></span></label>
                        </section>

                        {!orderItems.length && <p className="error">No items selected for checkout. Return to your cart and choose items to buy.</p>}
                        {autofillError && <p className="error" role="status">{autofillError}</p>}
                        {error && <p className="error">{error}</p>}
                        <button className="place-order-button" type="submit" disabled={isSubmitting || !orderItems.length}>{isSubmitting ? 'Placing order...' : 'Place order'} <span aria-hidden="true">-&gt;</span></button>
                    </form>

                    <aside className="checkout-summary">
                        <p className="eyebrow">YOUR ORDER</p>
                        <h2>Order summary</h2>
                        <div className="checkout-products">
                            {orderItems.map((item) => <div className="checkout-product" key={item._id}><img src={getProductImageUrl(item.image)} alt={item.name} /><div><strong>{item.name}</strong><span>Qty {item.quantity}</span></div><b>₹{(item.price * item.quantity).toLocaleString('en-IN')}</b></div>)}
                        </div>
                        <div className="summary-line"><span>Subtotal</span><strong>₹{total.toLocaleString('en-IN')}</strong></div>
                        <div className="summary-line"><span>Delivery</span><strong className="free-delivery">Free</strong></div>
                        <div className="summary-total"><span>Total</span><strong>₹{total.toLocaleString('en-IN')}</strong></div>
                        <p className="secure-note">Your details are used only to deliver this order.</p>
                    </aside>
                </div>
            </main>
        </>
    );
}
