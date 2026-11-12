import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import heroProduct from './image/Laptop.jpg';

const categoryIcons = { All: '✦', Electronics: '⌁', Fashion: '◌', Mobiles: '▣', Accessories: '◇' };
const sortOptions = [
  { value: '', label: 'Recommended' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' }
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    const closeSortMenu = (event) => {
      if (!sortMenuRef.current?.contains(event.target)) setSortOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSortOpen(false);
    };
    document.addEventListener('mousedown', closeSortMenu);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeSortMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const load = () => api.get('/products', { params: { q, category, sort } }).then((response) => setProducts(response.data));

  useEffect(() => {
    api.get('/products/categories').then((response) => setCategories(response.data));
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [q, category, sort]);

  const visibleCategories = [...new Set(['All', ...categories])];

  return (
    <div className="storefront">
      <Navbar q={q} onQueryChange={setQ} />
      <main className="home-container">
        <div className="home-layout">
          <aside className="collection-sidebar">
            <p className="eyebrow">BROWSE COLLECTION</p>
            <h1>Find your<br /><span>next favorite.</span></h1>
            <p className="sidebar-copy">Curated essentials and clever tech<br />for a better everyday.</p>
            <div className="category-list">
              {visibleCategories.map((item) => (
                <button
                  key={item}
                  className={category === item ? 'category-button selected' : 'category-button'}
                  onClick={() => setCategory(item)}
                >
                  <span>{categoryIcons[item] || '◈'}</span>{item}
                  {category === item && <i className="selected-icon" aria-hidden="true">→</i>}
                </button>
              ))}
            </div>
            <div className="delivery-note">
              <strong>New drops</strong>
              <span>every Friday</span>
            </div>
          </aside>

          <div className="shop-content">
            <section className="hero-panel">
              <div className="hero-copy">
                <span className="pill">Featured collection</span>
                <h2>Sequoia<br />inspiring <em>music.</em></h2>
                <p>Clear sounds, bold design.<br />Meet your new daily essential.</p>
                <a className="hero-button" href="#products">View all products <span>→</span></a>
              </div>
              <div className="hero-art">
                <div className="hero-circle" />
                <img src={heroProduct} alt="Featured laptop" />
              </div>
              <div className="hero-dots"><i /> <i className="active" /> <i /></div>
            </section>

            <section id="products" className="products-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">HANDPICKED FOR YOU</p>
                  <h2>More products</h2>
                </div>
                <div className="section-tools">
                  <div className={`sort-menu${sortOpen ? ' open' : ''}`} ref={sortMenuRef}>
                    <button className="sort-trigger" type="button" aria-expanded={sortOpen} aria-haspopup="listbox" onClick={() => setSortOpen((isOpen) => !isOpen)}>
                      <span>Sort: {sortOptions.find((option) => option.value === sort)?.label}</span>
                      <i className="sort-icon" aria-hidden="true"></i>
                    </button>
                    {sortOpen && <div className="sort-options" role="listbox" aria-label="Sort products">
                      {sortOptions.map((option) => <button className={sort === option.value ? 'sort-option selected' : 'sort-option'} type="button" role="option" aria-selected={sort === option.value} key={option.value} onClick={() => { setSort(option.value); setSortOpen(false); }}><span>{option.label}</span>{sort === option.value && <i className="selected-icon" aria-hidden="true">✓</i>}</button>)}
                    </div>}
                  </div>
                  <a href="#products">View all →</a>
                </div>
              </div>
              <div className="product-grid">
                {products.map((product) => <ProductCard key={product._id} product={product} />)}
              </div>
              {!products.length && <p className="empty">No products found.</p>}
            </section>
          </div>
        </div >
      </main >
      <footer className="site-footer">
        <strong>nivo<span>Store.</span></strong>
        <p>Thoughtful products for your everyday.</p>
        <small>© 2026 nivoStore. All rights reserved.</small>
      </footer>
    </div >
  );
}
