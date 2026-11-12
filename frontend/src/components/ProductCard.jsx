import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductImageUrl } from '../utils/productImage';

export default function ProductCard({ product }) {
  const { add } = useCart();

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link to={`/products/${product._id}`}>
          <img src={getProductImageUrl(product.image)} alt={product.name} />
        </Link>
        <button className="wishlist" aria-label={`Save ${product.name}`}>♡</button>
      </div>
      <div className="product-info">
        <small>{product.category || 'Electronics'}</small>
        <h3><Link to={`/products/${product._id}`}>{product.name}</Link></h3>
        <p className="product-description">Designed for your everyday.</p>
        <div className="product-footer">
          <strong>₹{product.price.toLocaleString('en-IN')}</strong>
          <button
            className="add-button"
            disabled={!product.stock}
            onClick={() => add(product)}
          >
            {product.stock ? 'Add to cart  +' : 'Out of stock'}
          </button>
        </div>
      </div>
    </article>
  );
}
