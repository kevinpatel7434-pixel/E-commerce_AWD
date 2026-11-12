import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await register(form);
            navigate(location.state?.from || '/', { state: location.state?.checkoutState });
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="auth-page">
            <Link className="auth-brand" to="/"><span>N</span> nivo<span>Store.</span></Link>
            <div className="auth-layout">
                <section className="auth-welcome"><p className="eyebrow">JOIN NIVOSTORE</p><h1>Make every order feel a little easier.</h1><p>Create your account to save your details, follow deliveries, and shop your everyday favourites faster.</p><Link to="/" className="auth-browse-link">Explore the store -&gt;</Link></section>
                <form className="auth-form" onSubmit={submit}>
                    <div className="auth-form-heading"><p className="eyebrow">NEW CUSTOMER</p><h2>Create your account</h2><p>It only takes a moment to get started.</p></div>
                    {error && <p className="error">{error}</p>}
                    <label>Full name<input required autoComplete="name" placeholder="e.g. Priya Patel" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
                    <label>Email address<input required type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
                    <label>Password<div className="password-field"><input required minLength="6" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 6 characters" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button></div><small className="field-hint">Use at least 6 characters.</small></label>
                    <button className="auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create account'} <span>-&gt;</span></button>
                    <p className="auth-switch">Already registered? <Link to="/login" state={location.state}>Sign in</Link></p>
                </form>
            </div>
        </div>
    );
}
