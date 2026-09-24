import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../services/api.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';

const CATEGORIES = [
  'wallets',
  'belts',
  'bags',
  'card-holders',
  'laptop-bags',
  'accessories',
];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: 'wallets',
  stock: '',
  material: 'Genuine leather',
  dimensions: '',
  colors: 'Black',
  rating: '4.5',
  images: [],
  isActive: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  usePageTitle(isEdit ? 'Edit Product — Admin' : 'Add Product — Admin');

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [manualPath, setManualPath] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    adminService
      .products({ search: '' })
      .then((list) => {
        const found = list.find((p) => p._id === id);
        if (found) {
          setForm({
            name: found.name,
            description: found.description,
            price: found.price,
            category: found.category,
            stock: found.stock,
            material: found.material || '',
            dimensions: found.dimensions || '',
            colors: found.colors?.join(', ') || '',
            rating: found.rating,
            images: found.images || [],
            isActive: found.isActive,
          });
        } else {
          setError('Product not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (field) => (e) => {
    const value = field === 'isActive' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await adminService.uploadImage(file);
      setForm((f) => ({ ...f, images: [...f.images, res.path] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addManualPath = () => {
    const path = manualPath.trim();
    if (!path) return;
    setForm((f) => ({ ...f, images: [...f.images, path] }));
    setManualPath('');
  };

  const removeImage = (index) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      material: form.material.trim(),
      dimensions: form.dimensions.trim(),
      colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
      rating: Number(form.rating),
      images: form.images,
      isActive: form.isActive,
    };

    try {
      if (isEdit) {
        await adminService.updateProduct(id, payload);
      } else {
        await adminService.createProduct(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading product…" />;

  return (
    <div className="max-w-2xl">
      <Link to="/admin/products" className="text-xs uppercase tracking-widest text-muted hover:text-primary">
        ← Back to products
      </Link>
      <h1 className="mt-2 font-heading text-3xl text-primary">
        {isEdit ? 'Edit product' : 'Add product'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted">Name *</label>
            <input value={form.name} onChange={update('name')} required className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted">Price (₹) *</label>
            <input type="number" min="0" value={form.price} onChange={update('price')} required className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted">Stock *</label>
            <input type="number" min="0" value={form.stock} onChange={update('stock')} required className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted">Category *</label>
            <select value={form.category} onChange={update('category')} className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace('-', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted">Rating (0–5)</label>
            <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={update('rating')} className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted">Material</label>
            <input value={form.material} onChange={update('material')} className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted">Dimensions</label>
            <input value={form.dimensions} onChange={update('dimensions')} placeholder="e.g. 11 x 9 x 2 cm" className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted">Colors</label>
            <input value={form.colors} onChange={update('colors')} placeholder="Black, Tan" className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted">Description *</label>
            <textarea value={form.description} onChange={update('description')} required rows={4} className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted">
              Images <span className="normal-case text-muted/70">(max 2 MB each)</span>
            </label>

            <div className="flex flex-wrap gap-3">
              {form.images.map((img, index) => (
                <div key={`${img}-${index}`} className="relative">
                  <img src={getImageUrl(img)} alt="" className="h-20 w-16 border border-line object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-700 text-xs text-white"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}

              <label className="flex h-20 w-16 cursor-pointer flex-col items-center justify-center border border-dashed border-line bg-bg text-xs text-muted hover:border-primary">
                <span>{uploading ? '…' : '+'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-3 flex max-w-sm gap-2">
              <input
                value={manualPath}
                onChange={(e) => setManualPath(e.target.value)}
                placeholder="Or paste a path, e.g. /images/products/x.svg"
                className="flex-1 border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={addManualPath}
                className="border border-primary px-4 py-2 text-xs uppercase tracking-widest text-primary hover:bg-primary hover:text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={update('isActive')} />
          Visible to customers (active)
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="border border-primary bg-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save product'}
          </button>
          <Link to="/admin/products" className="border border-primary px-8 py-3 text-center text-xs uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-white">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}