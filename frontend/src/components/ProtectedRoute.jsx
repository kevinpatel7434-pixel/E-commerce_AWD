import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
export default function ProtectedRoute({children,admin=false}){
    const {user}=useAuth();
    if(!user)
        return <Navigate to="/login" replace/>;
    if(admin&&user.role!=='admin')
        return <Navigate to="/" replace/>;
    if(!admin&&user.role==='admin')
        return <Navigate to="/admin" replace/>;
    return children;}

// Public customer pages (home, product details, cart) stay open to
// guests, but a logged-in admin is sent to the admin-only workspace instead.
export function AdminAway({children}){
    const {user}=useAuth();
    if(user?.role==='admin')
        return <Navigate to="/admin" replace/>;
    return children;}
