import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  usePageTitle('Products — Admin');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (query = '') => {
    setLoading(true);
    adminService
      .products({ search: query })
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (product) => {
    await adminService.updateProduct(product._id, { isActive: !product.isActive });
    load(search);
  };

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await adminService.deleteProduct(product._id);
    load(search);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl text-primary">Products</h1>
          <p className="mt-1 text-sm text-muted">{products ? `${products.length} product(s)` : ''}</p>
        </div>
        <Link
          to="/admin/products/new"
          className="border border-primary bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:opacity-90"
        >
          + Add product
        </Link>
      </div>

      <input
        type="search"
        placeholder="Search products…"
        defaultValue={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && load(e.target.value)}
        className="mt-4 w-full max-w-xs border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
      />

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {loading && <LoadingSpinner label="Loading products…" />}

      {!loading && products && (
        <>
          {products.length === 0 ? (
            <div className="mt-6 border border-line bg-white px-6 py-16 text-center text-muted">
              No products found.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto border border-line bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-bg">
                  <tr>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted">Product</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted">Category</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted">Price</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted">Stock</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-bg">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={getImageUrl(product.images?.[0])} alt="" className="h-10 w-8 object-cover" />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs uppercase tracking-wider text-muted">{product.category.replace('-', ' ')}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3">
                        <span className={product.stock <= 5 && product.isActive ? 'font-semibold text-red-700' : ''}>{product.stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block border px-2 py-0.5 text-xs ${product.isActive ? 'border-green-200 bg-green-50 text-green-700' : 'border-line bg-bg text-muted'}`}>
                          {product.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3 text-xs">
                          <button onClick={() => toggleActive(product)} className="text-muted hover:text-primary">
                            {product.isActive ? 'Hide' : 'Show'}
                          </button>
                          <Link to={`/admin/products/${product._id}/edit`} className="text-primary underline-offset-4 hover:underline">
                            Edit
                          </Link>
                          <button onClick={() => remove(product)} className="text-red-700 hover:underline">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}