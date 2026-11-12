import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ q = '', onQueryChange = () => { } }) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);
  const navLinkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;
  const customerName = user?.name?.trim() || 'Customer';
  const customerInitial = customerName.charAt(0).toUpperCase();

  const logoutUser = () => {
    logout();
    setAccountOpen(false);
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link className="brand" to="/">
          <span className="brand-mark">N</span>
          <span>nivo<span>Store.</span></span>
        </Link>

        <form className="searchbar" onSubmit={(event) => event.preventDefault()}>
          <span className="search-icon">⌕</span>
          <input
            value={q}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
          />
          <kbd>⌘ K</kbd>
        </form>

        <nav className="main-nav" aria-label="Main navigation">
          <NavLink className={navLinkClass} end to="/"><i className="fa fa-home" aria-hidden="true"></i> <span>Home</span></NavLink>
          {user?.role !== 'admin' && <NavLink className={navLinkClass} to="/cart"><i className="fa fa-shopping-bag" aria-hidden="true"></i> <span>Cart <b>{count}</b></span></NavLink>}
          {user?.role !== 'admin' && <NavLink className={navLinkClass} to="/checkout"><i className="fa fa-check-circle" aria-hidden="true"></i> <span>Checkout</span></NavLink>}
          {user && user.role !== 'admin' && <NavLink className={navLinkClass} to="/orders"><i className="fa fa-list" aria-hidden="true"></i> <span>My Orders</span></NavLink>}
          {user?.role === 'admin' && <NavLink className={navLinkClass} to="/admin"><i className="fa fa-user" aria-hidden="true"></i> <span>Admin</span></NavLink>}
        </nav>

        <div className={`account-actions${accountOpen ? ' open' : ''}`}>
          <button
            className="account-trigger"
            type="button"
            aria-expanded={accountOpen}
            aria-haspopup="menu"
            onClick={() => setAccountOpen((isOpen) => !isOpen)}
          >
            <span className="avatar" aria-hidden="true">{user ? customerInitial : 'U'}</span>
            <span className="account-name">{user ? customerName : 'Login'}</span>
            <i className="account-chevron" aria-hidden="true"></i>
          </button>

          {accountOpen && (
            <div className="account-menu" role="menu">
              <div className="account-menu-header">
                <strong>{user ? customerName : 'Welcome'}</strong>
                <span>{user?.email || 'Sign in or create your account'}</span>
              </div>
              {user ? (
                <>
                  <Link role="menuitem" to="/orders" onClick={() => setAccountOpen(false)}>My orders</Link>
                  <Link role="menuitem" to="/register" onClick={() => setAccountOpen(false)}>Register new user</Link>
                  <button role="menuitem" type="button" onClick={logoutUser}>Log out</button>
                </>
              ) : (
                <>
                  <Link role="menuitem" to="/login" onClick={() => setAccountOpen(false)}>Log in</Link>
                  <Link role="menuitem" to="/register" onClick={() => setAccountOpen(false)}>Register new user</Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
