import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const navLinkClass = ({ isActive }) =>
  `text-sm uppercase tracking-[0.15em] transition-colors hover:text-primary ${
    isActive ? 'text-primary font-semibold' : 'text-muted'
  }`;

export default function Navbar() {
  const { count } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="font-heading text-xl font-bold tracking-wide text-primary">
          LEATHER<span className="text-muted">-</span>HUB
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            Shop
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/track-order" className={navLinkClass}>
            Track Order
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="hidden text-xs uppercase tracking-[0.15em] text-primary underline-offset-4 hover:underline sm:block"
              >
                {user?.name?.split(' ')[0]}
              </Link>
              <button
                onClick={logout}
                className="hidden text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-primary sm:block"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden text-xs uppercase tracking-[0.15em] text-primary underline-offset-4 hover:underline sm:block"
            >
              Login
            </Link>
          )}

          <Link
            to="/cart"
            className="relative flex items-center gap-2 border border-primary px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Cart
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav className="flex items-center justify-center gap-6 border-t border-line py-2 md:hidden">
        <NavLink to="/" end className={navLinkClass}>
          Home
        </NavLink>
        <NavLink to="/shop" className={navLinkClass}>
          Shop
        </NavLink>
        <NavLink to="/about" className={navLinkClass}>
          About
        </NavLink>
        <NavLink to="/track-order" className={navLinkClass}>
          Track
        </NavLink>
        {isAuthenticated ? (
          <Link to="/dashboard" className={navLinkClass}>
            Account
          </Link>
        ) : (
          <Link to="/login" className={navLinkClass}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}