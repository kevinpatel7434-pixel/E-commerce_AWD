import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getProductImageUrl } from '../utils/productImage';

const blank = { name: '', price: '', category: 'Mobiles', image: '', stock: '' };
const statusFlow = ['Placed', 'Processing', 'Shipped', 'Delivered'];
const statusOptionsFor = (status) => {
    if (status === 'Delivered' || status === 'Cancelled') return [status];
    return [status, ...statusFlow.slice(statusFlow.indexOf(status) + 1), 'Cancelled'];
};
const navItems = [
    { key: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
    { key: 'products', label: 'Products', icon: 'fa-box' },
    { key: 'orders', label: 'Orders', icon: 'fa-receipt' },
    { key: 'customers', label: 'Customers', icon: 'fa-users' },
    { key: 'reports', label: 'Reports', icon: 'fa-chart-bar' }
];

const formatINR = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Admin() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState('overview');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState(null);
    const [topProducts, setTopProducts] = useState(null);
    const [form, setForm] = useState(blank);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [editing, setEditing] = useState(null);
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'user' });
    const [editingUser, setEditingUser] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const load = () => Promise.all([
        api.get('/products/admin/all').then((response) => setProducts(response.data)),
        api.get('/orders').then((response) => setOrders(response.data)),
        api.get('/users').then((response) => setUsers(response.data))
    ]).catch(() => setError('Could not load the dashboard data.'));

    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (view !== 'reports') return;
        api.get('/reports/summary').then((response) => setSummary(response.data)).catch(() => setSummary(null));
        api.get('/reports/top-products').then((response) => setTopProducts(response.data)).catch(() => setTopProducts(null));
    }, [view]);

    useEffect(() => {
        if (!imageFile) {
            setImagePreview(getProductImageUrl(form.image));
            return undefined;
        }
        const previewUrl = URL.createObjectURL(imageFile);
        setImagePreview(previewUrl);
        return () => URL.revokeObjectURL(previewUrl);
    }, [form.image, imageFile]);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const adjustPrice = (amount) => {
        setForm((current) => {
            const price = Number(current.price) || 0;
            return { ...current, price: String(Math.max(100, price + amount)) };
        });
    };

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        const price = Number(form.price);
        const stock = Number(form.stock);
        if (!Number.isFinite(price) || price <= 0 || price > Number.MAX_SAFE_INTEGER) {
            setError('Price must be greater than 0.');
            return;
        }
        if (!Number.isSafeInteger(stock) || stock < 0 || stock > Number.MAX_SAFE_INTEGER) {
            setError('Stock must be a whole number (0 or more).');
            return;
        }
        try {
            const productData = new FormData();
            productData.append('name', form.name);
            productData.append('category', form.category);
            productData.append('price', price);
            productData.append('stock', stock);
            if (form.image) productData.append('image', form.image);
            if (imageFile) productData.append('imageFile', imageFile);
            if (editing) await api.put(`/products/${editing}`, productData);
            else await api.post('/products', productData);
            setForm(blank);
            setImageFile(null);
            setEditing(null);
            setMessage(editing ? 'Product updated successfully.' : 'Product added successfully.');
            load();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not save the product.');
        }
    };

    const edit = (product) => {
        setEditing(product._id);
        setForm({
            name: product.name,
            price: String(product.price),
            category: product.category,
            image: product.image || '',
            stock: String(product.stock)
        });
        setImageFile(null);
        setMessage('');
        setView('products');
    };
    const cancelEdit = () => { setEditing(null); setForm(blank); setImageFile(null); };
    const toggleActive = async (product) => {
        try {
            await api.patch(`/products/${product._id}/active`, { active: product.active === false });
            setMessage(product.active !== false ? 'Product deactivated. Customers can no longer see it.' : 'Product activated. Customers can see it again.');
            load();
        } catch (requestError) { setError(requestError.response?.data?.message || 'Could not update the product status.'); }
    };
    const updateStatus = async (id, status) => {
        try { await api.patch(`/orders/${id}/status`, { status }); setMessage('Order status updated.'); load(); }
        catch (requestError) { setError(requestError.response?.data?.message || 'Could not update order status.'); }
    };
    const editUser = (customer) => { setEditingUser(customer.id); setUserForm({ name: customer.name, email: customer.email, password: '', role: customer.role }); setMessage(''); };
    const cancelUserEdit = () => { setEditingUser(null); setUserForm({ name: '', email: '', password: '', role: 'user' }); };
    const updateUserField = (event) => setUserForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    const saveUser = async (event) => {
        event.preventDefault();
        try {
            await api.patch(`/users/${editingUser}`, userForm);
            setMessage('User details updated successfully.');
            cancelUserEdit();
            load();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not update the user.');
        }
    };
    const toggleUserActive = async (customer) => {
        const active = customer.active === false;
        try {
            await api.patch(`/users/${customer.id}/active`, { active });
            setMessage(active ? 'User activated.' : 'User deactivated.');
            load();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not update the user status.');
        }
    };

    const logoutAdmin = () => { logout(); navigate('/login'); };

    const totalRevenue = orders.filter((order) => order.status !== 'Cancelled').reduce((sum, order) => sum + order.totalAmount, 0);
    const groupedOrders = (() => {
        const groups = [];
        const byUser = new Map();
        orders.forEach((order) => {
            const key = order.user?._id || order.user?.email || order._id;
            if (!byUser.has(key)) {
                const entry = {
                    key,
                    name: order.user?.name || order.shippingAddress?.fullName || 'Customer',
                    contact: order.shippingAddress?.phone || order.user?.email || '',
                    address: order.shippingAddress?.address ? [order.shippingAddress.address, order.shippingAddress.city, order.shippingAddress.pincode].filter(Boolean).join(', ') : '',
                    orders: []
                };
                byUser.set(key, entry);
                groups.push(entry);
            }
            byUser.get(key).orders.push(order);
        });
        return groups;
    })();
    const lowStock = products.filter((product) => product.stock < 10).length;
    const maxTopQty = topProducts?.values?.length ? Math.max(...topProducts.values) : 0;
    const adminName = user?.name?.trim() || 'Administrator';
    const isPrimaryAdmin = user?.email?.trim().toLowerCase() === 'admin@electromart.com';
    const isPrimaryAdminEditing = users.some((customer) => customer.id === editingUser && customer.email?.toLowerCase() === 'admin@electromart.com');

    return (
        <div className="admin-workspace">
            <aside className="admin-sidebar">
                <span className="admin-brand"><span className="admin-brand-mark">N</span><span>nivo Admin</span></span>
                <nav className="admin-nav" aria-label="Admin navigation">
                    {navItems.map((item) => (
                        <button key={item.key} type="button" className={view === item.key ? 'active' : ''} onClick={() => { setView(item.key); setMessage(''); setError(''); }}>
                            <i className={`fa ${item.icon}`} aria-hidden="true"></i><span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="admin-sidebar-footer">
                    <span className="admin-user-dot">{adminName.charAt(0).toUpperCase()}</span>
                    <span>{adminName}</span>
                    <button type="button" onClick={logoutAdmin} aria-label="Logout" title="Logout"><i className="fa fa-sign-out-alt" aria-hidden="true"></i></button>
                </div>
            </aside>

            <main className="admin-main">
                {message && <p className="admin-success">{message}</p>}
                {error && <p className="error">{error}</p>}

                {view === 'overview' && (
                    <>
                        <div className="admin-page-heading">
                            <div><span className="admin-eyebrow">Admin workspace</span><h1>Overview</h1><p>Keep your catalog, orders, and stock moving smoothly.</p></div>
                            <button className="admin-outline-button" type="button" onClick={() => { cancelEdit(); setView('products'); }}><i className="fa fa-plus" aria-hidden="true"></i> Add product</button>
                        </div>
                        <div className="admin-stat-grid">
                            <div className="admin-stat-card"><span className="admin-stat-icon mint"><i className="fa fa-box" aria-hidden="true"></i></span><div><span>Total products</span><strong>{products.length}</strong></div></div>
                            <div className="admin-stat-card"><span className="admin-stat-icon gold"><i className="fa fa-receipt" aria-hidden="true"></i></span><div><span>Total orders</span><strong>{orders.length}</strong></div></div>
                            <div className="admin-stat-card"><span className="admin-stat-icon blue"><i className="fa fa-wallet" aria-hidden="true"></i></span><div><span>Total revenue</span><strong>{formatINR(totalRevenue)}</strong></div></div>
                            <div className="admin-stat-card"><span className="admin-stat-icon coral"><i className="fa fa-exclamation-triangle" aria-hidden="true"></i></span><div><span>Low stock</span><strong>{lowStock}</strong></div></div>
                        </div>
                        <section className="admin-panel">
                            <div className="admin-panel-heading"><div><span className="admin-eyebrow">Activity</span><h2>Recent orders</h2></div><button className="admin-text-link" type="button" onClick={() => setView('orders')}>View all <i className="fa fa-arrow-right" aria-hidden="true"></i></button></div>
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead><tr><th>Order ID</th><th>Items</th><th>Status</th><th>Total</th></tr></thead>
                                    <tbody>
                                        {!orders.length && <tr><td colSpan="4" className="admin-empty-cell">No orders found.</td></tr>}
                                        {orders.slice(0, 5).map((order) => (
                                            <tr key={order._id}>
                                                <td><strong>#{order._id.slice(-8).toUpperCase()}</strong></td>
                                                <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                                                <td><span className={`admin-status ${order.status.toLowerCase()}`}>{order.status}</span></td>
                                                <td><strong>{formatINR(order.totalAmount)}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}

                {view === 'products' && (
                    <>
                        <div className="admin-page-heading">
                            <div><span className="admin-eyebrow">Catalog</span><h1>Products</h1><p>Add new products and keep stock and prices up to date.</p></div>
                        </div>
                        <section className="admin-panel">
                            <div className="admin-panel-heading"><div><span className="admin-eyebrow">{editing ? 'Edit product' : 'New product'}</span><h2>{editing ? 'Update product' : 'Add a product'}</h2></div>{editing && <button className="admin-text-link" type="button" onClick={cancelEdit}>Cancel editing</button>}</div>
                            <form className="admin-form-grid" onSubmit={submit}>
                                <label>Product name<input name="name" required value={form.name} onChange={updateField} placeholder="e.g. Wireless headphones" /></label>
                                <label>Category<select name="category" required value={form.category} onChange={updateField}><option>Mobiles</option><option>Electronics</option><option>Accessories</option><option>Fashion</option></select></label>
                                <label>Price<div className="price-control"><input name="price" type="number" min="100" step="100" required value={form.price} onChange={updateField} placeholder="0" /><div className="price-adjustments"><button type="button" onClick={() => adjustPrice(100)} aria-label="Increase price by 100">+</button><button type="button" onClick={() => adjustPrice(-100)} aria-label="Decrease price by 100">−</button></div></div></label>
                                <label>Stock<input name="stock" type="number" min="1" step="1" required value={form.stock} onChange={updateField} placeholder="0" /></label>
                                <label className="admin-field-wide">Upload product image<input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setImageFile(event.target.files?.[0] || null)} /><small>JPEG, PNG, WebP, or GIF · up to 10 MB</small></label>
                                {imagePreview && <img className="admin-image-preview admin-field-wide" src={imagePreview} alt="Product preview" />}
                                <button className="admin-primary-button" type="submit">{editing ? 'Update product' : 'Add product'} <span>-&gt;</span></button>
                            </form>
                        </section>
                        <section className="admin-panel">
                            <div className="admin-panel-heading"><div><span className="admin-eyebrow">Inventory</span><h2>All products</h2></div></div>
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {!products.length && <tr><td colSpan="6" className="admin-empty-cell">No products found.</td></tr>}
                                        {products.map((product) => (
                                            <tr key={product._id}>
                                                <td><div className="admin-product-cell"><img src={getProductImageUrl(product.image)} alt={product.name} /><strong>{product.name}</strong></div></td>
                                                <td>{product.category}</td>
                                                <td><strong>{formatINR(product.price)}</strong></td>
                                                <td><span className={`admin-status ${product.stock < 10 ? 'pending' : 'delivered'}`}>{product.stock} in stock</span></td>
                                                <td><span className={`admin-status ${product.active !== false ? 'delivered' : 'cancelled'}`}>{product.active !== false ? 'Active' : 'Inactive'}</span></td>
                                                <td><div className="admin-row-actions"><button type="button" onClick={() => edit(product)}>Edit</button><button type="button" onClick={() => toggleActive(product)}>{product.active !== false ? 'Deactivate' : 'Activate'}</button></div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}

                {view === 'orders' && (
                    <>
                        <div className="admin-page-heading">
                            <div><span className="admin-eyebrow">Fulfilment</span><h1>Orders</h1><p>Track customer orders and update their delivery status.</p></div>
                        </div>
                        <section className="admin-panel">
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {!orders.length && <tr><td colSpan="5" className="admin-empty-cell">No orders found.</td></tr>}
                                        {groupedOrders.map((group) => group.orders.map((order, orderIndex) => (
                                            <tr key={order._id}>
                                                <td><strong>#{order._id.slice(-8).toUpperCase()}</strong><br /><span className="admin-muted">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></td>
                                                {orderIndex === 0 && (
                                                    <td rowSpan={group.orders.length}>{group.name}{group.contact && <><br /><span className="admin-muted">{group.contact}</span></>}{group.address && <><br /><span className="admin-muted">{group.address}</span></>}</td>
                                                )}
                                                <td>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</td>
                                                <td><strong>{formatINR(order.totalAmount)}</strong></td>
                                                <td><select className="admin-status-select" value={order.status} style={{ width: '140px' }} disabled={statusOptionsFor(order.status).length === 1} onChange={(event) => updateStatus(order._id, event.target.value)}>{statusOptionsFor(order.status).map((status) => <option key={status}>{status}</option>)}</select></td>
                                            </tr>
                                        )))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}

                {view === 'customers' && (
                    <>
                        <div className="admin-page-heading">
                            <div><span className="admin-eyebrow">Customer access</span><h1>Customers</h1><p>Manage customer accounts and admin access.</p></div>
                        </div>
                        <section className="admin-panel">
                            <div className="admin-panel-heading"><div><span className="admin-eyebrow">Accounts</span><h2>User management</h2></div><span className="admin-muted">Passwords are encrypted and never displayed.</span></div>
                            {editingUser && (
                                <form className="admin-form-grid" onSubmit={saveUser}>
                                    <label>Username<input name="name" required value={userForm.name} onChange={updateUserField} /></label>
                                    <label>Email<input name="email" type="email" required value={userForm.email} onChange={updateUserField} /></label>
                                    <label>New password<input name="password" type="password" minLength="6" value={userForm.password} onChange={updateUserField} placeholder="Leave blank to keep current" /></label>
                                    <label>Role<select name="role" value={userForm.role} onChange={updateUserField} disabled={isPrimaryAdminEditing}><option value="user">User</option><option value="admin">Admin</option></select></label>
                                    <div className="admin-row-actions"><button className="admin-primary-button" type="submit">Save user</button><button className="admin-text-link" type="button" onClick={cancelUserEdit}>Cancel</button></div>
                                </form>
                            )}
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead><tr><th>Customer</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {!users.length && <tr><td colSpan="5" className="admin-empty-cell">No customers found.</td></tr>}
                                        {users.map((customer) => (
                                            <tr key={customer.id}>
                                                <td><div className="admin-product-cell"><span className="admin-user-dot">{customer.name?.charAt(0).toUpperCase() || 'U'}</span><strong>{customer.name}</strong></div></td>
                                                <td>{customer.email}</td>
                                                <td><span className={`admin-status ${customer.role === 'admin' ? 'processing' : 'placed'}`}>{customer.role}</span></td>
                                                <td><span className={`admin-status ${customer.active === false ? 'cancelled' : 'delivered'}`}>{customer.active === false ? 'Inactive' : 'Active'}</span></td>
                                                <td>{isPrimaryAdmin && <div className="admin-row-actions"><button type="button" onClick={() => editUser(customer)}>Manage</button>{customer.email?.toLowerCase() !== 'admin@electromart.com' && <button type="button" onClick={() => toggleUserActive(customer)}>{customer.active === false ? 'Activate' : 'Deactivate'}</button>}</div>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}

                {view === 'reports' && (
                    <>
                        <div className="admin-page-heading">
                            <div><span className="admin-eyebrow">Admin workspace</span><h1>Reports</h1><p>See which products are driving your store.</p></div>
                        </div>
                        <div className="admin-stat-grid admin-report-stats">
                            <div className="admin-stat-card"><span className="admin-stat-icon blue"><i className="fa fa-wallet" aria-hidden="true"></i></span><div><span>Total revenue</span><strong>{summary ? formatINR(summary.revenue) : '...'}</strong></div></div>
                            <div className="admin-stat-card"><span className="admin-stat-icon gold"><i className="fa fa-receipt" aria-hidden="true"></i></span><div><span>Total orders</span><strong>{summary ? summary.orders : '...'}</strong></div></div>
                        </div>
                        <section className="admin-panel">
                            <div className="admin-panel-heading"><div><span className="admin-eyebrow">Product performance</span><h2>Top products</h2></div></div>
                            {!topProducts && <p className="admin-muted">Loading report...</p>}
                            {topProducts && !topProducts.labels.length && <p className="admin-empty-cell">No sales yet. Top products will appear after the first order.</p>}
                            {topProducts && topProducts.labels.length > 0 && (
                                <div className="admin-bar-chart">
                                    {topProducts.labels.map((label, index) => (
                                        <div className="admin-bar-row" key={label}>
                                            <span className="admin-bar-label">{label}</span>
                                            <div className="admin-bar-track"><div className="admin-bar-fill" style={{ width: `${maxTopQty ? (topProducts.values[index] / maxTopQty) * 100 : 0}%` }} /></div>
                                            <strong>{topProducts.values[index]} sold</strong>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div >
    );
}
