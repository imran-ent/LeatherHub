import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { getImageUrl } from '../utils/imageUrl.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();
  usePageTitle(product?.name ? product.name : 'Product');

  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    productService
      .getProduct(id)
      .then((res) => {
        if (!cancelled) setProduct(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setQuantity(1);
    setActiveImage(0);
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading product…" />;

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <p className="text-muted">{error || 'Product not found'}</p>
        <Link
          to="/shop"
          className="mt-8 inline-block border border-primary px-8 py-3 text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-white"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-xs uppercase tracking-widest text-muted">
        <Link to="/shop" className="hover:text-primary">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="capitalize">{product.category.replace('-', ' ')}</span>
        <span className="mx-2">/</span>
        <span className="text-text">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/5] overflow-hidden bg-bg">
            <img
              src={getImageUrl(images[activeImage])}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-16 overflow-hidden border ${
                    i === activeImage ? 'border-primary' : 'border-line'
                  }`}
                >
                  <img src={getImageUrl(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <h1 className="font-heading text-3xl text-primary">{product.name}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <span className="text-primary">★</span> {product.rating}
            {outOfStock ? (
              <span className="ml-2 text-red-700">Out of stock</span>
            ) : (
              <span className="ml-2">Available: {product.stock}</span>
            )}
          </p>

          <p className="mt-4 text-2xl font-semibold text-text">
            {formatCurrency(product.price)}
          </p>

          <p className="mt-6 leading-relaxed text-text/80">{product.description}</p>

          <dl className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
            {product.material && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Material</dt>
                <dd>{product.material}</dd>
              </div>
            )}
            {product.dimensions && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Dimensions</dt>
                <dd>{product.dimensions}</dd>
              </div>
            )}
            {product.colors?.length > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Available colors</dt>
                <dd className="text-right">{product.colors.join(', ')}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-line bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={outOfStock}
                className="px-4 py-3 text-lg hover:bg-bg disabled:text-line"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={outOfStock || quantity >= product.stock}
                className="px-4 py-3 text-lg hover:bg-bg disabled:text-line"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => addItem(product, quantity)}
              disabled={outOfStock}
              className="flex-1 border border-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-white disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
            >
              Add to cart
            </button>
            <Link
              to="/cart"
              onClick={() => addItem(product, quantity)}
              className="flex-1 border border-primary bg-primary px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              aria-disabled={outOfStock}
              style={outOfStock ? { pointerEvents: 'none', opacity: 0.4 } : undefined}
            >
              Buy now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
