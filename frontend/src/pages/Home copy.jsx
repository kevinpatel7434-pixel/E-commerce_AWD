import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom'; 
import api from '../services/api'; 
import ProductCard from '../components/ProductCard';
import offer from './img/offer-1.jpg';
import carousel from './img/carousel-1.jpg';
import offer2 from './img/offer-2.jpg';
export default function Home(){
    const [products,setProducts]=useState([]),[categories,setCategories]=useState([]),[q,setQ]=useState(''),[category,setCategory]=useState('All'),[sort,setSort]=useState('');
 const load=()=>api.get('/products',{params:{q,category,sort}}).then(r=>setProducts(r.data)); 
 useEffect(()=>{api.get('/products/categories').then(r=>setCategories(r.data));load()},[]); 
 useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[q,category,sort]);
 return( <><section className="hero">
    <div>
        <h1>Electronics for your everyday life.</h1>
        <p>Shop mobiles, laptops, audio, gaming and accessories.</p>
        <Link className="button" to="#products">Shop Now</Link>
    </div>
</section>
<section id="products" className="container">
    <div className="toolbar">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products, brands..."/>
        <select value={category} onChange={e=>setCategory(e.target.value)}><option>All</option>{categories.map(c=><option key={c}>{c}</option>)}</select>
        <select value={sort} onChange={e=>setSort(e.target.value)}><option value="">Sort</option><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option></select>
    </div>
    <div className="grid">{products.map(p=><ProductCard key={p._id} product={p}/>)}</div>
    
          {/* Carousel & Offer Banners Section */}
          <div className="row px-xl-5 mb-3">
            <div className="col-lg-8">
              <div id="header-carousel" className="carousel slide carousel-fade mb-30 mb-lg-0" data-ride="carousel">
                <div className="carousel-inner">
                  <div className="carousel-item position-relative active" style={{ height: '430px' }}>
                    <img className="position-absolute w-100 h-100" src={carousel} alt="Men Fashion" style={{ objectFit: 'cover' }} />
                    <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
                      <div className="p-3" style={{ maxWidth: '700px' }}>
                        <h1 className="display-4 text-white mb-3">Men Fashion</h1>
                        <p className="mx-md-5 px-5">Explore top quality men apparel and style trends.</p>
                        <a className="btn btn-outline-light py-2 px-4 mt-3" href="#product">Shop Now</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="product-offer mb-30" style={{ height: '200px', margin: '15px' }}>
                <img className="img-fluid position-absolute" src={offer} alt="Special Offer" />
                <div className="offer-text position-relative text-center">
                  <h6 className="display-4 text-white text-uppercase">Save 20%</h6>
                  <h3 className="text-white mb-3">Special Offer</h3>
                  <a href="#product" className="btn btn-warning">Shop Now</a>
                </div>
              </div>
              <div className="product-offer mb-30" style={{ height: '200px', margin: '15px' }}>
                <img className="img-fluid position-absolute" src={offer2} alt="Special Offer" />
                <div className="offer-text position-relative text-center">
                  <h1 className="display-4 text-white text-uppercase">Save 20%</h1>
                  <h3 className="text-white mb-3">Special Offer</h3>
                  <a href="#product" className="btn btn-warning">Shop Now</a>
                </div>
              </div>
            </div>
          </div>
        
      


    
    {!products.length&&<p className="empty">No products found.</p>}
</section></>)}
