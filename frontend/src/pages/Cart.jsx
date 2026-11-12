import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { getProductImageUrl } from '../utils/productImage';

export default function Cart() {
    const { items, update, remove, clear } = useCart();
    const { user } = useAuth();
    const nav = useNavigate();
    const [selectedIds, setSelectedIds] = useState(() => items.map((item) => item._id));
    const selectedItems = items.filter((item) => selectedIds.includes(item._id));
    const selectedTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const allSelected = selectedItems.length === items.length;
    const toggleSelected = (id) => {
        setSelectedIds((current) => current.includes(id)
            ? current.filter((selectedId) => selectedId !== id)
            : [...current, id]);
    };
    if (!items.length) {
        return (
            <>
                <Navbar />
                <main className="container cart-page">
                    <section className="empty-cart">
                        <span className="empty-cart-icon" aria-hidden="true">[ ]</span>
                        <p className="eyebrow">YOUR SHOPPING BAG</p>
                        <h1>Your cart is waiting.</h1>
                        <p>Add something you love and it will appear here.</p>
                        <Link className="cart-primary-button" to="/">Browse products <span aria-hidden="true">-&gt;</span></Link>
                    </section>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="container cart-page">
                <div className="cart-heading">
                    <div>
                        <p className="eyebrow">YOUR SHOPPING BAG</p>
                        <h1>Shopping cart</h1>
                        <p>{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
                    </div>
                    <Link className="continue-shopping" to="/">&lt;- Continue shopping</Link>
                </div>

                <div className="cart-layout">
                    <section className="cart-items" aria-label="Cart items">
                        <label className="cart-select-all">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(event) => setSelectedIds(event.target.checked ? items.map((item) => item._id) : [])}
                            />
                            Select all items
                        </label>
                        {items.map((item) => (
                            <article className="cartrow" key={item._id}>
                                <input
                                    className="cart-item-checkbox"
                                    type="checkbox"
                                    checked={selectedIds.includes(item._id)}
                                    onChange={() => toggleSelected(item._id)}
                                    aria-label={`Select ${item.name} to buy`}
                                />
                                <img src={getProductImageUrl(item.image)} alt={item.name} />
                                <div className="cart-item-info">
                                    <p className="cart-item-category">{item.category || 'Product'}</p>
                                    <h2>{item.name}</h2>
                                    <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')} each</p>
                                </div>
                                <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                                    <button type="button" onClick={() => update(item._id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label={`Decrease ${item.name} quantity`}>-</button>
                                    <span>{item.quantity}</span>
                                    <button type="button" onClick={() => update(item._id, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label={`Increase ${item.name} quantity`}>+</button>
                                </div>
                                <strong className="cart-item-total">₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                                <button className="remove-button" type="button" onClick={() => remove(item._id)} aria-label={`Remove ${item.name}`}>Remove</button>
                            </article>
                        ))}
                        <button className="clear-cart-button" type="button" onClick={clear}>Clear cart</button>
                    </section>

                    <aside className="cart-summary">
                        <p className="eyebrow">ORDER SUMMARY</p>
                        <h2>Almost yours</h2>
                        <div className="summary-line"><span>Selected items</span><strong>{selectedItems.length} / {items.length}</strong></div>
                        <div className="summary-line"><span>Subtotal</span><strong>₹{selectedTotal.toLocaleString('en-IN')}</strong></div>
                        <div className="summary-line"><span>Delivery</span><strong className="free-delivery">Free</strong></div>
                        <div className="summary-total"><span>Total</span><strong>₹{selectedTotal.toLocaleString('en-IN')}</strong></div>
                        {user ? (
                            <button className="cart-primary-button" type="button" disabled={!selectedItems.length} onClick={() => nav('/checkout', { state: { selectedItemIds: selectedItems.map((item) => item._id) } })}>Buy selected items <span aria-hidden="true">-&gt;</span></button>
                        ) : (
                            <button className="cart-primary-button" type="button" disabled={!selectedItems.length} onClick={() => nav('/login', { state: { from: '/checkout', checkoutState: { selectedItemIds: selectedItems.map((item) => item._id) } } })}>Login to checkout <span aria-hidden="true">-&gt;</span></button>
                        )}
                        <p className="secure-note">Secure checkout · Easy returns</p>
                    </aside>
                </div>
            </main>
        </>
    );
}
