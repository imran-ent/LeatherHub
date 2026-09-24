import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { cartService } from '../services/api.js';

const CartContext = createContext(null);

const STORAGE_KEY = 'leather-hub-cart';

function loadLocalCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : { items: [] };
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch {
    return { items: [] };
  }
}

function saveLocalCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function clearLocalCart() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Cart behaviour:
 * - Anonymous: items live in localStorage only.
 * - Logged in: the server cart is the source of truth; the anonymous cart
 *   is merged in once on login. Every mutation goes through the API.
 */
export function CartProvider({ children }) {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [cart, setCart] = useState(loadLocalCart);
  const [ready, setReady] = useState(false);
  const initializedFor = useRef(null);

  // Load / merge the cart whenever the auth state settles.
  useEffect(() => {
    if (authLoading) return;

    const key = isAuthenticated ? `user:${user?._id}` : 'anon';
    if (initializedFor.current === key) return;
    initializedFor.current = key;

    if (!isAuthenticated) {
      setCart(loadLocalCart());
      setReady(true);
      return;
    }

    const local = loadLocalCart();
    const applyServer = (res) => {
      setCart({ items: res.items || [] });
      setReady(true);
    };

    if (local.items.length > 0) {
      // Merge the anonymous cart into the server cart once.
      cartService
        .merge(local.items.map((i) => ({ productId: i.product._id, quantity: i.quantity })))
        .then((res) => {
          clearLocalCart();
          applyServer(res);
        })
        .catch(() => cartService.getCart().then(applyServer));
    } else {
      cartService.getCart().then(applyServer);
    }
  }, [authLoading, isAuthenticated, user?._id]);

  // Persist local cart for anonymous sessions only.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      saveLocalCart(cart);
    }
  }, [cart, authLoading, isAuthenticated]);

  const addItem = (product, quantity = 1) => {
    if (isAuthenticated) {
      cartService
        .addItem(product._id, quantity)
        .then((res) => setCart({ items: res.items || [] }))
        .catch(() => {});
      return;
    }

    setCart((prev) => {
      const existing = prev.items.find((i) => i.product._id === product._id);
      if (existing) {
        return {
          items: prev.items.map((i) =>
            i.product._id === product._id
              ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
              : i
          ),
        };
      }
      return { items: [...prev.items, { product, quantity: Math.min(quantity, product.stock) }] };
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (isAuthenticated) {
      cartService
        .updateQuantity(productId, quantity)
        .then((res) => setCart({ items: res.items || [] }))
        .catch(() => {});
      return;
    }

    setCart((prev) => ({
      items: prev.items
        .map((i) =>
          i.product._id === productId
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.product.stock)) }
            : i
        )
        .filter((i) => i.quantity > 0),
    }));
  };

  const removeItem = (productId) => {
    if (isAuthenticated) {
      cartService
        .removeItem(productId)
        .then((res) => setCart({ items: res.items || [] }))
        .catch(() => {});
      return;
    }

    setCart((prev) => ({ items: prev.items.filter((i) => i.product._id !== productId) }));
  };

  const clearCart = () => {
    if (isAuthenticated) {
      cartService.clearCart().then((res) => setCart({ items: res.items || [] })).catch(() => {});
      return;
    }
    setCart({ items: [] });
  };

  const count = useMemo(() => cart.items.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  const subtotal = useMemo(
    () => cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{ items: cart.items, count, subtotal, ready, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}