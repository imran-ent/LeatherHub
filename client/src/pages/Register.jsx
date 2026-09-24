import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  usePageTitle('Create Account');

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (form.password !== form.confirm) {
      return setError('Passwords do not match');
    }

    setSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
      <h1 className="text-center font-heading text-3xl text-primary">CREATE ACCOUNT</h1>
      <p className="mt-2 text-center text-sm text-muted">
        Join Leather-Hub for faster checkout and order tracking.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs uppercase tracking-widest text-muted">
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={update('name')}
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-widest text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-xs uppercase tracking-widest text-muted">
            Phone (optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={update('phone')}
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
            value={form.password}
            onChange={update('password')}
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="mb-1.5 block text-xs uppercase tracking-widest text-muted">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            required
            value={form.confirm}
            onChange={update('confirm')}
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full border border-primary bg-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}