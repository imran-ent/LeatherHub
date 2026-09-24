import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/api.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';

const PAYMENT_BADGE = {
  pending: 'bg-bg text-muted border-line',
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  verified: 'bg-green-50 text-green-700 border-green-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  usePageTitle('Orders — Admin');
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminService
      .orders({ status, search, page, limit: 10 })
      .then((res) => {
        if (!cancelled) setData(res);
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
  }, [status, search, page]);

  const setStatus = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('status', value);
    else next.delete('status');
    next.delete('page');
    setSearchParams(next);
  };

  const setSearch = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('search', value);
    else next.delete('search');
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl text-primary">Orders</h1>
          <p className="mt-1 text-sm text-muted">{data ? `${data.total} order(s)` : ''}</p>
        </div>
        <input
          type="search"
          placeholder="Search order / customer…"
          defaultValue={search}
          onKeyDown={(e) => e.key === 'Enter' && setSearch(e.target.value)}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary sm:max-w-xs"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStatus('')}
          className={`border px-3 py-1.5 text-xs uppercase tracking-wider ${status === '' ? 'border-primary bg-primary text-white' : 'border-line bg-white'}`}
        >
          All
        </button>
        {['ORDER_PLACED', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`border px-3 py-1.5 text-xs uppercase tracking-wider ${status === s ? 'border-primary bg-primary text-white' : 'border-line bg-white'}`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {loading && <LoadingSpinner label="Loading orders…" />}

      {!loading && data && (
        <>
          {data.orders.length === 0 ? (
            <div className="mt-6 border border-line bg-white px-6 py-16 text-center text-muted">
              No orders match.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto border border-line bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-bg">
                  <tr>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted">Order</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted">Customer</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted">Amount</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted">Payment</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.orders.map((order) => (
                    <tr key={order._id} className="hover:bg-bg">
                      <td className="px-4 py-3">
                        <Link to={`/admin/orders/${order._id}`} className="font-semibold text-primary hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{order.customer.name}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block border px-2 py-0.5 text-xs ${PAYMENT_BADGE[order.payment.status] || PAYMENT_BADGE.pending}`}>
                          {order.payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs uppercase tracking-wider">{order.status.replace(/_/g, ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.pages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page - 1 })} disabled={page <= 1} className="border border-line bg-white px-4 py-2 disabled:opacity-40">←</button>
              <span className="px-3 py-2 text-sm text-muted">Page {page} / {data.pages}</span>
              <button onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page + 1 })} disabled={page >= data.pages} className="border border-line bg-white px-4 py-2 disabled:opacity-40">→</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}