import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { getImageUrl } from '../utils/imageUrl.js';
import usePageTitle from '../hooks/usePageTitle.js';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();
  usePageTitle('Cart');

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-3xl text-primary">YOUR CART</h1>
        <p className="mt-4 text-muted">Your cart is empty.</p>
        <Link
          to="/shop"
          className="mt-8 inline-block border border-primary px-8 py-3 text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-white"
        >
          Shop collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl text-primary">YOUR CART</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="divide-y divide-line border border-line bg-white">
          {items.map(({ product, quantity }) => (
            <div key={product._id} className="flex gap-4 p-4 sm:p-5">
              <Link
                to={`/product/${product._id}`}
                className="block h-28 w-22 shrink-0 overflow-hidden bg-bg sm:h-32 sm:w-26"
              >
                <img
                  src={getImageUrl(product.images?.[0])}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="text-sm font-medium text-text hover:text-primary">
                      {product.name}
                    </h3>
                  </Link>
                  <button
                    onClick={() => removeItem(product._id)}
                    className="text-xs uppercase tracking-widest text-muted transition-colors hover:text-primary"
                    aria-label={`Remove ${product.name}`}
                  >
                    Remove
                  </button>
                </div>

                <p className="mt-1 text-sm text-muted">
                  {formatCurrency(product.price)} each
                </p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center border border-line">
                    <button
                      onClick={() => updateQuantity(product._id, quantity - 1)}
                      className="px-3 py-1.5 text-sm text-text hover:bg-bg"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product._id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="px-3 py-1.5 text-sm text-text hover:bg-bg disabled:text-line"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatCurrency(product.price * quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <div className="p-4 sm:p-5">
            <button
              onClick={clearCart}
              className="text-xs uppercase tracking-widest text-muted transition-colors hover:text-primary"
            >
              Clear cart
            </button>
          </div>
        </div>

        <aside className="h-fit border border-line bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
            Summary
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="text-muted">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-line pt-4 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block w-full border border-primary bg-primary px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
          >
            Proceed to checkout
          </Link>
          <p className="mt-3 text-center text-xs text-muted">
            You'll sign in at checkout if needed.
          </p>
        </aside>
      </div>
    </div>
  );
}
