import { useEffect, useState } from 'react';
import { adminService } from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import usePageTitle from '../../hooks/usePageTitle.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  usePageTitle('Admin Dashboard');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .stats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading stats…" />;

  const cards = [
    { label: 'Orders', value: stats?.totalOrders ?? '—' },
    { label: 'Sales', value: formatCurrency(stats?.sales ?? 0) },
    { label: 'Total stock', value: stats?.totalStock ?? '—' },
    { label: 'Customers', value: stats?.totalUsers ?? '—' },
  ];

  const alerts = [
    { label: 'Payments awaiting verification', value: stats?.unpaidOrders ?? '—', highlight: (stats?.unpaidOrders ?? 0) > 0 },
    { label: 'Low stock items (≤5)', value: stats?.lowStock ?? '—', highlight: (stats?.lowStock ?? 0) > 0 },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl text-primary">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">Store overview at a glance.</p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="border border-line bg-white p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{card.label}</p>
            <p className="mt-3 text-2xl font-bold text-primary">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {alerts.map((a) => (
          <div
            key={a.label}
            className={`border px-6 py-5 ${a.highlight ? 'border-red-300 bg-red-50' : 'border-line bg-white'}`}
          >
            <p className={`text-sm ${a.highlight ? 'font-medium text-red-700' : 'text-muted'}`}>{a.label}</p>
            <p className={`mt-2 text-3xl font-bold ${a.highlight ? 'text-red-700' : 'text-primary'}`}>{a.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}