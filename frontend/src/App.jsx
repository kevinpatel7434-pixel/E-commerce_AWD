import {BrowserRouter,Routes,Route} from 'react-router-dom';
import ProtectedRoute, {AdminAway} from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
export default function App(){
    return (
        <BrowserRouter>

            <Routes>
                <Route path="/" element={<AdminAway><Home/></AdminAway>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/products/:id" element={<AdminAway><ProductDetails/></AdminAway>}/>
                <Route path="/cart" element={<AdminAway><Cart/></AdminAway>}/>
                <Route path="/checkout" element={<ProtectedRoute><Checkout/></ProtectedRoute>}/>
                <Route path="/orders" element={<ProtectedRoute><Orders/></ProtectedRoute>}/>
                <Route path="/admin" element={<ProtectedRoute admin><Admin/></ProtectedRoute>}/>
            </Routes>
        </BrowserRouter>
    );
}
