import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { orderService, userService } from '../services/api.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'orders', label: 'My Orders' },
  { key: 'profile', label: 'Profile' },
  { key: 'addresses', label: 'Addresses' },
];

const emptyAddress = { address: '', city: '', state: '', pincode: '' };

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  usePageTitle('My Account');
  const [active, setActive] = useState('overview');

  const [orders, setOrders] = useState(null);
  const [ordersError, setOrdersError] = useState('');

  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [addresses, setAddresses] = useState(null);
  const [addrError, setAddrError] = useState('');
  const [editingAddr, setEditingAddr] = useState(null); // subdoc or the "new" sentinel
  const [addrForm, setAddrForm] = useState(emptyAddress);
  const [addrSaving, setAddrSaving] = useState(false);

  const loadOrders = () => {
    orderService
      .myOrders()
      .then(setOrders)
      .catch((err) => setOrdersError(err.message));
  };

  const loadAddresses = () => {
    userService
      .getAddresses()
      .then(setAddresses)
      .catch((err) => setAddrError(err.message));
  };

  useEffect(() => {
    if (active === 'orders') loadOrders();
    if (active === 'addresses') loadAddresses();
    if (active === 'profile') setProfileForm({ name: user?.name || '', phone: user?.phone || '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');
    setSavingProfile(true);
    try {
      const updated = await userService.updateProfile(profileForm);
      updateUser({ name: updated.name, phone: updated.phone });
      setProfileMsg('Profile updated');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const startAddAddress = () => {
    setEditingAddr('new');
    setAddrForm(emptyAddress);
  };

  const startEditAddress = (addr) => {
    setEditingAddr(addr._id);
    setAddrForm({ address: addr.address, city: addr.city, state: addr.state, pincode: addr.pincode });
  };

  const cancelAddress = () => {
    setEditingAddr(null);
    setAddrForm(emptyAddress);
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    setAddrError('');
    setAddrSaving(true);
    try {
      if (editingAddr === 'new') {
        setAddresses(await userService.addAddress(addrForm));
      } else {
        setAddresses(await userService.updateAddress(editingAddr, addrForm));
      }
      cancelAddress();
    } catch (err) {
      setAddrError(err.message);
    } finally {
      setAddrSaving(false);
    }
  };

  const removeAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    setAddresses(await userService.deleteAddress(id));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl text-primary">MY ACCOUNT</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit border border-line bg-white">
          <div className="border-b border-line p-4">
            <p className="font-semibold text-text">{user?.name}</p>
            <p className="mt-0.5 text-xs text-muted">{user?.email}</p>
          </div>

          <nav className="p-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  active === tab.key ? 'bg-primary font-medium text-white' : 'text-text hover:bg-bg'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={logout}
              className="block w-full px-4 py-2.5 text-left text-sm text-muted transition-colors hover:bg-bg hover:text-primary"
            >
              Logout
            </button>
          </nav>
        </aside>

        <section>
          {active === 'overview' && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="border border-line bg-white p-6">
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Account</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-muted">Name</dt><dd>{user?.name}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Email</dt><dd>{user?.email}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Phone</dt><dd>{user?.phone || '—'}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Role</dt><dd className="capitalize">{user?.role}</dd></div>
                </dl>
              </div>

              <div className="border border-line bg-white p-6">
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Orders</h2>
                <p className="mt-4 text-sm text-muted">
                  {orders ? `${orders.length} order(s). ` : ''}
                  View them in the My Orders tab.
                </p>
              </div>
            </div>
          )}

          {active === 'orders' && (
            <div className="border border-line bg-white">
              <div className="flex justify-between px-6 py-5">
                <h2 className="font-heading text-xl text-primary">My Orders</h2>
                <button onClick={loadOrders} className="text-xs uppercase tracking-widest text-muted hover:text-primary">
                  Refresh
                </button>
              </div>

              {ordersError && <p className="px-6 pb-4 text-sm text-red-700">{ordersError}</p>}
              {!ordersError && orders === null && <LoadingSpinner label="Loading orders…" />}

              {!ordersError && orders && orders.length === 0 && (
                <div className="px-6 pb-12 text-center">
                  <p className="text-sm text-muted">No orders yet.</p>
                  <Link to="/shop" className="mt-4 inline-block border border-primary px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-white">
                    Shop collection
                  </Link>
                </div>
              )}

              {!ordersError && orders && orders.length > 0 && (
                <ul className="divide-y divide-line border-t border-line">
                  {orders.map((order) => (
                    <li key={order._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                      <div>
                        <p className="font-medium text-text">{order.orderNumber}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {order.items?.length || 0} item(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold">{formatCurrency(order.total)}</span>
                        <span className="border border-line bg-bg px-3 py-1 text-xs uppercase tracking-wider text-muted">
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                        <Link to={`/track-order?order=${order.orderNumber}`} className="text-xs text-primary underline-offset-4 hover:underline">
                          Track
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {active === 'profile' && (
            <form onSubmit={saveProfile} className="max-w-md border border-line bg-white p-6">
              <h2 className="font-heading text-xl text-primary">Profile</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted">Name</label>
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted">Phone</label>
                  <input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              {profileError && <p className="mt-3 text-sm text-red-700">{profileError}</p>}
              {profileMsg && <p className="mt-3 text-sm text-green-700">{profileMsg}</p>}

              <button
                type="submit"
                disabled={savingProfile}
                className="mt-5 border border-primary bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:opacity-90 disabled:opacity-50"
              >
                {savingProfile ? 'Saving…' : 'Save profile'}
              </button>
            </form>
          )}

          {active === 'addresses' && (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl text-primary">Addresses</h2>
                <button
                  onClick={startAddAddress}
                  className="border border-primary px-4 py-2 text-xs uppercase tracking-widest text-primary hover:bg-primary hover:text-white"
                >
                  + Add address
                </button>
              </div>

              {addrError && <p className="mt-3 text-sm text-red-700">{addrError}</p>}
              {addresses === null && <LoadingSpinner label="Loading addresses…" />}

              {editingAddr && (
                <form onSubmit={saveAddress} className="mt-5 grid max-w-lg gap-4 border border-line bg-white p-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs uppercase tracking-widest text-muted">Address</label>
                    <input value={addrForm.address} onChange={(e) => setAddrForm((f) => ({ ...f, address: e.target.value }))} required className="w-full border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-muted">City</label>
                    <input value={addrForm.city} onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))} required className="w-full border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-muted">State</label>
                    <input value={addrForm.state} onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))} required className="w-full border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-muted">Pincode</label>
                    <input value={addrForm.pincode} onChange={(e) => setAddrForm((f) => ({ ...f, pincode: e.target.value }))} required pattern="[0-9]{6}" className="w-full border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="flex items-end gap-3 sm:col-span-2">
                    <button type="submit" disabled={addrSaving} className="border border-primary bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50">
                      {addrSaving ? 'Saving…' : 'Save address'}
                    </button>
                    <button type="button" onClick={cancelAddress} className="px-4 py-2 text-xs uppercase tracking-widest text-muted hover:text-primary">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {addresses && addresses.length === 0 && (
                <div className="mt-5 border border-line bg-white px-6 py-12 text-center text-sm text-muted">
                  No saved addresses yet.
                </div>
              )}

              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {addresses?.map((addr) => (
                  <li key={addr._id} className="border border-line bg-white p-5">
                    <p className="text-sm font-medium text-text">{addr.address}</p>
                    <p className="mt-1 text-sm text-muted">
                      {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                    <div className="mt-4 flex gap-4 text-xs">
                      <button onClick={() => startEditAddress(addr)} className="text-primary underline-offset-4 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => removeAddress(addr._id)} className="text-red-700 hover:underline">
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}