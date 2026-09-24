import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { orderService, userService } from '../services/api.js';
import usePageTitle from '../hooks/usePageTitle.js';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

const emptyErrors = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  usePageTitle('Checkout');

  const [form, setForm] = useState({
    ...emptyForm,
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState(emptyErrors);
  const [couponCode, setCouponCode] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    userService
      .getAddresses()
      .then(setSavedAddresses)
      .catch(() => setSavedAddresses([]));
  }, []);

  const applyAddress = (addr) => {
    setForm((f) => ({
      ...f,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    }));
  };

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const next = { ...emptyErrors };
    if (!form.name.trim()) next.name = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'A valid email is required';
    if (!/^\d{10,15}$/.test(form.phone.trim())) next.phone = 'Enter a valid phone number';
    if (!form.address.trim()) next.address = 'Address is required';
    if (!form.city.trim()) next.city = 'City is required';
    if (!form.state.trim()) next.state = 'State is required';
    if (!/^\d{6}$/.test(form.pincode.trim())) next.pincode = 'Enter a 6-digit pincode';
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;

    // The backend recomputes every price — only productId + quantity go up.
    const payload = {
      items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
      customer: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      },
      shippingAddress: {
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      },
      couponCode: couponCode.trim() || undefined,
    };

    setSubmitting(true);
    try {
      const res = await orderService.placeOrder(payload);
      clearCart();
      setPlacedOrder(res.order);
      navigate(`/order-success/${res.order._id}`, { replace: true });
    } catch (err) {
      setErrors((er) => ({ ...er, _server: err.message }));
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl text-primary">CHECKOUT</h1>

      {items.length === 0 && !placedOrder ? (
        <div className="mt-8 border border-line bg-white px-6 py-16 text-center">
          <p className="text-muted">Your cart is empty.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block border border-primary px-8 py-3 text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Shop collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Customer information */}
          <section className="space-y-6">
            <div className="border border-line bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                1 · Customer information
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted">Full name</label>
                  <input value={form.name} onChange={update('name')} className="w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary" />
                  {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted">Phone</label>
                  <input value={form.phone} onChange={update('phone')} className="w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary" />
                  {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted">Email</label>
                  <input type="email" value={form.email} onChange={update('email')} className="w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary" />
                  {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
                </div>
              </div>
            </div>

            <div className="border border-line bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                2 · Shipping address
              </h2>

              {savedAddresses.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr._id}
                      type="button"
                      onClick={() => applyAddress(addr)}
                      className={`border px-3 py-2 text-left text-xs transition-colors ${
                        form.address === addr.address && form.city === addr.city
                          ? 'border-primary bg-primary text-white'
                          : 'border-line bg-bg text-text hover:border-primary'
                      }`}
                    >
                      {addr.address}
                      <span className="block text-[10px] uppercase tracking-wider opacity-70">
                        {addr.city}, {addr.state} — {addr.pincode}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted">Address</label>
                  <input value={form.address} onChange={update('address')} placeholder="House, street, area" className="w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary" />
                  {errors.address && <p className="mt-1 text-xs text-red-700">{errors.address}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted">City</label>
                  <input value={form.city} onChange={update('city')} className="w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary" />
                  {errors.city && <p className="mt-1 text-xs text-red-700">{errors.city}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted">State</label>
                  <input value={form.state} onChange={update('state')} className="w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary" />
                  {errors.state && <p className="mt-1 text-xs text-red-700">{errors.state}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted">Pincode</label>
                  <input value={form.pincode} onChange={update('pincode')} className="w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary" />
                  {errors.pincode && <p className="mt-1 text-xs text-red-700">{errors.pincode}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Order summary */}
          <aside className="h-fit border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Order summary</h2>

            <ul className="mt-4 divide-y divide-line">
              {items.map(({ product, quantity }) => (
                <li key={product._id} className="flex justify-between gap-4 py-3 text-sm">
                  <span className="text-text">
                    {product.name} <span className="text-muted">× {quantity}</span>
                  </span>
                  <span className="font-medium">{formatCurrency(product.price * quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon (e.g. WELCOME10)"
                className="flex-1 border border-line bg-bg px-3 py-2 text-sm uppercase outline-none focus:border-primary"
              />
            </div>

            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatCurrency(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Discount</dt>
                <dd>Applied at order</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </dl>

            <p className="mt-4 text-xs text-muted">
              Payment method: <span className="font-medium text-text">UPI</span> — you will pay manually after the
              order is placed.
            </p>

            {errors._server && <p className="mt-3 text-sm text-red-700">{errors._server}</p>}

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="mt-6 w-full border border-primary bg-primary px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Placing order…' : 'Place order'}
            </button>
            <Link to="/cart" className="mt-3 block text-center text-xs uppercase tracking-widest text-muted hover:text-primary">
              Back to cart
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}