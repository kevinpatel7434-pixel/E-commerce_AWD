import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(form);
      if (loggedInUser?.role === 'admin') navigate('/admin');
      else navigate(location.state?.from || '/', { state: location.state?.checkoutState });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Link className="auth-brand" to="/"><span>N</span> nivo<span>Store.</span></Link>
      <div className="auth-layout">
        <section className="auth-welcome"><p className="eyebrow">WELCOME BACK</p><h1>Your everyday essentials, ready when you are.</h1><p>Sign in to check out faster, track orders, and keep your shopping in one place.</p><Link to="/" className="auth-browse-link">Browse products -&gt;</Link></section>
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-form-heading"><p className="eyebrow">CUSTOMER LOGIN</p><h2>Sign in to nivoStore</h2><p>Welcome back. Enter your details to continue.</p></div>
          {error && <p className="error">{error}</p>}
          <label>Email address<input required type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Password<div className="password-field"><input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
          <button className="auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in'} <span>-&gt;</span></button>
          <p className="auth-switch">New customer? <Link to="/register" state={location.state}>Create an account</Link></p>
        </form>
      </div>
    </div>
  );
}