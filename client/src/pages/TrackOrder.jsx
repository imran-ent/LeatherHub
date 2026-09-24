import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderService } from '../services/api.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import OrderTimeline from '../components/OrderTimeline.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  usePageTitle('Track Order');
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await orderService.track(orderNumber.trim(), email.trim());
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <h1 className="text-center font-heading text-3xl text-primary">ORDER TRACKING</h1>
      <p className="mt-3 text-center text-sm text-muted">
        Enter your order ID and the email used at checkout.
      </p>

      <form onSubmit={handleTrack} className="mx-auto mt-8 flex max-w-md flex-col gap-4">
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Order ID (e.g. LTH-20260812-001)"
          required
          className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email used at checkout"
          required
          className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="border border-primary bg-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Tracking…' : 'Track order'}
        </button>
      </form>

      {error && (
        <p className="mx-auto mt-6 max-w-md border border-line bg-white px-6 py-4 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      {loading && <LoadingSpinner label="Fetching order…" />}

      {result && (
        <div className="mt-10">
          <div className="border border-line bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="font-heading text-xl text-primary">{result.orderNumber}</p>
                <p className="mt-1 text-sm text-muted">Placed on {new Date(result.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
              <p className="text-lg font-semibold text-text">{formatCurrency(result.total)}</p>
            </div>

            <ul className="mt-4 divide-y divide-line">
              {result.items.map((item) => (
                <li key={item.name} className="flex justify-between gap-4 py-3 text-sm">
                  <span className="text-text">{item.name} <span className="text-muted">× {item.quantity}</span></span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
              {result.discount > 0 && (
                <li className="flex justify-between py-3 text-sm">
                  <span className="text-muted">Discount</span>
                  <span className="text-muted">−{formatCurrency(result.discount)}</span>
                </li>
              )}
            </ul>

            <p className="mt-4 text-sm">
              Payment:{' '}
              <span className="font-medium text-text">
                {result.paymentStatus === 'verified' ? 'Paid (verified)' : result.paymentStatus}
              </span>
            </p>

            <div className="mt-8">
              <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-muted">Order progress</h2>
              <OrderTimeline statusHistory={result.statusHistory} status={result.status} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}