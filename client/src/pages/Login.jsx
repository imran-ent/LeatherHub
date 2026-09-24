import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  usePageTitle('Sign In');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
      <h1 className="text-center font-heading text-3xl text-primary">SIGN IN</h1>
      <p className="mt-2 text-center text-sm text-muted">
        Welcome back to Leather-Hub.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-widest text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs uppercase tracking-widest text-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full border border-primary bg-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        New here?{' '}
        <Link to="/register" className="text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}