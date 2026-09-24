import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/api.js';
import ProductGrid from '../components/ProductGrid.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'wallets', label: 'Wallets' },
  { value: 'belts', label: 'Belts' },
  { value: 'bags', label: 'Bags' },
  { value: 'card-holders', label: 'Card Holders' },
  { value: 'laptop-bags', label: 'Laptop Bags' },
  { value: 'accessories', label: 'Accessories' },
];

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name-asc', label: 'Name: A–Z' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  usePageTitle('Shop');

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    productService
      .getProducts({ category, search, sort, page, limit: 8 })
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
  }, [category, search, sort, page]);

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value === undefined || value === 1) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl text-primary">SHOP</h1>

      {/* Search + sort */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search products…"
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateParams({ search: e.target.value, page: '' });
          }}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary sm:max-w-xs"
        />
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value, page: '' })}
          className="border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => updateParams({ category: c.value, page: '' })}
            className={`border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${
              category === c.value
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-white text-text hover:border-primary'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {loading && <LoadingSpinner label="Loading products…" />}
        {error && (
          <div className="border border-line bg-white px-6 py-16 text-center text-muted">
            {error}
          </div>
        )}
        {!loading && !error && data && (
          <>
            <p className="mb-6 text-sm text-muted">
              {data.total} product{data.total === 1 ? '' : 's'}
            </p>
            <ProductGrid products={data.products} />

            {data.pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => updateParams({ page: page - 1 })}
                  disabled={page <= 1}
                  className="border border-line bg-white px-4 py-2 text-sm disabled:opacity-40"
                >
                  ←
                </button>
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateParams({ page: p })}
                    className={`h-9 w-9 text-sm ${
                      p === page
                        ? 'bg-primary text-white'
                        : 'border border-line bg-white hover:border-primary'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => updateParams({ page: page + 1 })}
                  disabled={page >= data.pages}
                  className="border border-line bg-white px-4 py-2 text-sm disabled:opacity-40"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
