import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderService } from '../services/api.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

export default function OrderSuccess() {
  const { id } = useParams();
  usePageTitle('Order Confirmation');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [upiRef, setUpiRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    let cancelled = false;
    orderService
      .getOrder(id)
      .then((res) => {
        if (!cancelled) setOrder(res);
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

  const handleSubmitRef = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setPayError('');
    try {
      const res = await orderService.submitPayment(order._id, upiRef.trim());
      setOrder(res.order);
    } catch (err) {
      setPayError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading order…" />;

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-muted">{error || 'Order not found'}</p>
        <Link
          to="/"
          className="mt-8 inline-block border border-primary px-8 py-3 text-xs uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-white"
        >
          Back home
        </Link>
      </div>
    );
  }

  const paymentDone = order.payment.status === 'verified';

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary text-2xl text-primary">
          ✓
        </div>
        <h1 className="mt-4 font-heading text-3xl text-primary">ORDER PLACED</h1>
        <p className="mt-2 text-muted">
          Order <span className="font-semibold text-text">{order.orderNumber}</span>
        </p>
        <p className="text-lg font-semibold text-text">{formatCurrency(order.total)}</p>
        <p className="mt-1 text-sm text-muted">
          A confirmation has been sent to {order.customer.email}.
        </p>
      </div>

      {/* Manual UPI payment */}
      <div className="mt-10 border border-line bg-white p-6 sm:p-8">
        <h2 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted">
          SCAN & PAY
        </h2>

        <div className="mt-6 flex flex-col items-center">
          <img
            src="/images/upi-qr.png"
            alt="UPI payment QR code"
            className="h-52 w-52 border border-line bg-white p-2"
          />
          <p className="mt-4 text-sm text-text">Amount: {formatCurrency(order.total)}</p>
          <p className="mt-1 text-sm text-muted">UPI ID: yourname@upi</p>
          <p className="mt-3 max-w-sm text-center text-xs leading-relaxed text-muted">
            Pay the exact amount using any UPI app, then enter your transaction ID
            (UTR) below. Our team verifies it manually before shipping.
          </p>
        </div>

        {order.payment.status === 'verified' ? (
          <p className="mt-6 border border-line bg-bg px-4 py-3 text-center text-sm font-medium text-text">
            Payment verified. Thank you!
          </p>
        ) : order.payment.status === 'submitted' ? (
          <div className="mt-6 border border-line bg-bg px-4 py-3 text-center text-sm text-text">
            Payment submitted (UTR{' '}
            <span className="font-semibold">{order.payment.utr}</span>). Awaiting
            verification.
          </div>
        ) : (
          <form onSubmit={handleSubmitRef} className="mt-6">
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted">
              Transaction ID / UTR
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={upiRef}
                onChange={(e) => setUpiRef(e.target.value)}
                placeholder="e.g. 914520098765"
                required
                className="flex-1 border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={submitting}
                className="border border-primary bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'I have paid'}
              </button>
            </div>
            {payError && <p className="mt-2 text-sm text-red-700">{payError}</p>}
          </form>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <Link
          to={`/track-order?order=${order.orderNumber}`}
          className="border border-primary px-8 py-3 text-xs uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-white"
        >
          Track order
        </Link>
        <Link
          to="/shop"
          className="border border-primary bg-primary px-8 py-3 text-xs uppercase tracking-[0.2em] text-white hover:opacity-90"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}