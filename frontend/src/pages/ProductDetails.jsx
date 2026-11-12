import {useEffect,useState} from 'react';
import {useParams} from 'react-router-dom';
import api from '../services/api';
import {useCart} from '../context/CartContext';
import { getProductImageUrl } from '../utils/productImage';
export default function ProductDetails(){
    const {id}=useParams();const [p,setP]=useState(null);
    const [qty,setQty]=useState('1');
    const {add}=useCart();
    useEffect(()=>{api.get(`/products/${id}`).then(r=>setP(r.data))},[id]);
    if(!p){
        return( <main className="container"><p>Loading...</p></main>);
    }
    return(<main className="container detail">
        <img src={getProductImageUrl(p.image)} alt={p.name}/>
        <div>
            <small>{p.brand} · {p.category}</small>
            <h1>{p.name}</h1>
            <p>{p.description}</p>
            <h2>₹{p.price.toLocaleString('en-IN')}</h2>
            <p>{p.stock} available</p>
            <input className="qty" type="number" min="1" max={p.stock} value={qty} onChange={e=>setQty(e.target.value)}/>
            <button disabled={!p.stock} onClick={()=>add(p,Math.max(1,Math.min(parseInt(qty,10)||1,p.stock)))}>Add to Cart</button>
        </div>
    </main>);
}
