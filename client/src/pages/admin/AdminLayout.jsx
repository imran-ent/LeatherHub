import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `block px-4 py-2.5 text-sm transition-colors ${
    isActive ? 'bg-primary font-medium text-white' : 'text-bg/80 hover:bg-white/10 hover:text-white'
  }`;

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-[70vh]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-primary text-bg">
        <div className="border-b border-white/10 px-5 py-5">
          <Link to="/" className="font-heading text-lg font-bold">
            LEATHER-HUB
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">Admin</p>
        </div>
        <nav className="space-y-1 p-3">
          <NavLink to="/admin" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            Orders
          </NavLink>
          <NavLink to="/admin/products" className={linkClass}>
            Products
          </NavLink>
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="w-full py-2 text-left text-sm text-white/60 transition-colors hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}