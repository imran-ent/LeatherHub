import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminService } from '../../services/api.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import OrderTimeline from '../../components/OrderTimeline.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';

const STATUS_OPTIONS = [
  'ORDER_PLACED',
  'PAYMENT_PENDING',
  'PAYMENT_VERIFIED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrderDetails() {
  const { id } = useParams();
  usePageTitle('Order Details — Admin');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getOrder(id)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status) => {
    const res = await adminService.updateStatus(order._id, status);
    setOrder(res.order);
  };

  const verifyPayment = async (verified) => {
    const res = await adminService.verifyPayment(order._id, verified);
    setOrder(res.order);
  };

  if (loading) return <LoadingSpinner label="Loading order…" />;

  if (error || !order) {
    return (
      <div>
        <p className="text-sm text-red-700">{error || 'Order not found'}</p>
        <Link to="/admin/orders" className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link to="/admin/orders" className="text-xs uppercase tracking-widest text-muted hover:text-primary">
        ← Back to orders
      </Link>
      <h1 className="mt-2 font-heading text-3xl text-primary">{order.orderNumber}</h1>
      <p className="mt-1 text-sm text-muted">
        Placed {new Date(order.createdAt).toLocaleString('en-IN')}
      </p>

      {/* Payment verification */}
      <div className="mt-6 border border-line bg-white p-6">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Payment</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Method</dt>
            <dd className="font-medium">{order.payment.method}</dd>
          </div>
          <div>
            <dt className="text-muted">Status</dt>
            <dd className="font-medium capitalize">{order.payment.status}</dd>
          </div>
          <div>
            <dt className="text-muted">UTR</dt>
            <dd className="font-mono">{order.payment.utr || '—'}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => verifyPayment(true)}
            disabled={order.payment.status === 'verified' || !order.payment.utr}
            className="border border-green-700 bg-green-700 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Verify payment
          </button>
          {order.payment.utr && order.payment.status !== 'verified' && (
            <button
              onClick={() => verifyPayment(false)}
              className="border border-red-700 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-700 hover:bg-red-700 hover:text-white"
            >
              Mark failed
            </button>
          )}
        </div>
      </div>

      {/* Status control */}
      <div className="mt-6 border border-line bg-white p-6">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Order status</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className={`border px-3 py-1.5 text-xs uppercase tracking-wider ${
                order.status === s ? 'border-primary bg-primary text-white' : 'border-line bg-bg text-text hover:border-primary'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Customer + shipping */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="border border-line bg-white p-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Customer</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Name</dt><dd>{order.customer.name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Email</dt><dd>{order.customer.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Phone</dt><dd>{order.customer.phone}</dd></div>
          </dl>
        </div>
        <div className="border border-line bg-white p-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Shipping</h2>
          <p className="mt-4 text-sm leading-relaxed text-text/80">
            {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
            {order.shippingAddress.state} — {order.shippingAddress.pincode}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 border border-line bg-white p-6">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Items</h2>
        <ul className="mt-4 divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-text">
                {item.name} <span className="text-muted">× {item.quantity}</span>
              </span>
              <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
          {order.discount > 0 && (
            <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd>−{formatCurrency(order.discount)}</dd></div>
          )}
          <div className="flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
        </dl>
      </div>

      {/* Timeline */}
      <div className="mt-6 border border-line bg-white p-6">
        <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-muted">History</h2>
        <OrderTimeline statusHistory={order.statusHistory} status={order.status} />
      </div>
    </div>
  );
}