import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { getImageUrl } from '../utils/imageUrl.js';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;

  return (
    <div className="group flex flex-col border border-line bg-white transition-shadow hover:shadow-lg">
      {/* Fixed 4:5 aspect ratio prevents layout shift while images load */}
      <Link to={`/product/${product._id}`} className="relative block aspect-[4/5] overflow-hidden bg-bg">
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {outOfStock && (
          <span className="absolute top-3 left-3 bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm font-medium leading-snug text-text hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-xs text-muted">
          <span className="text-primary">★</span>
          <span>{product.rating}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <p className="text-sm font-semibold text-text">
            {formatCurrency(product.price)}
          </p>
          <button
            onClick={() => addItem(product)}
            disabled={outOfStock}
            className="border border-primary px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
          >
            {outOfStock ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
