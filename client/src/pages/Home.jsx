import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api.js';
import ProductGrid from '../components/ProductGrid.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const categories = [
  { label: 'Wallets', value: 'wallets', image: '/images/products/classic-leather-wallet.svg' },
  { label: 'Belts', value: 'belts', image: '/images/products/classic-leather-belt.svg' },
  { label: 'Bags', value: 'bags', image: '/images/products/heritage-leather-bag.svg' },
  { label: 'Card Holders', value: 'card-holders', image: '/images/products/slim-card-holder.svg' },
  { label: 'Laptop Bags', value: 'laptop-bags', image: '/images/products/laptop-leather-briefcase.svg' },
  { label: 'Accessories', value: 'accessories', image: '/images/products/key-holder-with-brass-ring.svg' },
];

const reviews = [
  {
    name: 'Rahul S.',
    text: 'The wallet arrived beautifully packed and the leather feels genuinely premium. Stitching is flawless.',
  },
  {
    name: 'Ananya M.',
    text: 'I have owned my Leather-Hub bag for 8 months now — it only looks better with age. Worth every rupee.',
  },
  {
    name: 'Imran K.',
    text: 'Ordered a belt and a card holder. Great communication and the craftsmanship is top notch.',
  },
];

const perks = [
  {
    title: 'Genuine leather',
    text: 'Full-grain and genuine leather, hand-picked and finished with honest materials.',
  },
  {
    title: 'Hand stitched',
    text: 'Every piece is assembled by craftspeople who take pride in the details.',
  },
  {
    title: 'Built to last',
    text: 'We make products for years, not seasons. Repair and care guidance included.',
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    productService
      .getProducts({ sort: 'rating', limit: 8 })
      .then((res) => setFeatured(res.products))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="grid items-stretch border-b border-line lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-20 sm:px-12 lg:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Premium leather goods
          </p>
          <h1 className="mt-4 font-heading text-5xl leading-tight text-primary sm:text-6xl lg:text-7xl">
            Crafted for
            <br />
            everyday.
            <br />
            Built to last.
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-muted">
            Wallets, belts, bags and accessories in full-grain leather — designed
            with restraint, made to age beautifully.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="border border-primary bg-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
            >
              Shop collection
            </Link>
            <Link
              to="/about"
              className="border border-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Our story
            </Link>
          </div>
        </div>

        <div className="relative min-h-[320px] lg:min-h-0">
          <img
            src="/images/products/heritage-leather-bag.svg"
            alt="Handcrafted leather bag"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Featured</p>
            <h2 className="mt-2 font-heading text-3xl text-primary">Bestsellers</h2>
          </div>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-[0.2em] text-primary underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="mt-8">
          {loading ? (
            <LoadingSpinner label="Loading bestsellers…" />
          ) : (
            <ProductGrid products={featured} />
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Categories</p>
          <h2 className="mt-2 font-heading text-3xl text-primary">Shop by category</h2>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                to={`/shop?category=${cat.value}`}
                className="group"
              >
                <div className="aspect-[4/5] overflow-hidden border border-line bg-bg">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-center text-xs uppercase tracking-[0.2em] text-text group-hover:text-primary">
                  {cat.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section className="grid items-center gap-10 px-6 py-20 sm:px-12 lg:grid-cols-2 lg:py-28">
        <div className="order-2 lg:order-1">
          <img
            src="/images/products/laptop-leather-briefcase.svg"
            alt="Leather craftsmanship"
            className="aspect-[4/5] w-full max-w-lg object-cover"
          />
        </div>
        <div className="order-1 lg:order-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Our story</p>
          <h2 className="mt-4 font-heading text-4xl leading-tight text-primary">
            Leather that earns
            <br />
            its character.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-muted">
            Leather-Hub began with a simple idea — that everyday carry items should
            be made to be kept. We work with small tanneries, cut honest patterns,
            and hand-finish every edge. The result is a piece that starts beautiful
            and only gets better with wear.
          </p>
          <Link
            to="/about"
            className="mt-8 inline-block border border-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Read our story
          </Link>
        </div>
      </section>

      {/* Why our leather */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Why us</p>
          <h2 className="mt-2 font-heading text-3xl text-primary">Why our leather</h2>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {perks.map((perk) => (
              <div key={perk.title} className="border border-line bg-bg p-6">
                <h3 className="font-heading text-xl text-primary">{perk.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{perk.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Reviews</p>
        <h2 className="mt-2 font-heading text-3xl text-primary">What customers say</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <figure key={review.name} className="border border-line bg-white p-6">
              <p className="text-primary">★★★★★</p>
              <blockquote className="mt-4 text-sm leading-relaxed text-text/80">
                “{review.text}”
              </blockquote>
              <figcaption className="mt-4 text-xs uppercase tracking-widest text-muted">
                — {review.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary px-6 py-16 text-bg sm:px-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-bg/50">Newsletter</p>
          <h2 className="mt-3 font-heading text-3xl">Join the Leather-Hub list</h2>
          <p className="mt-3 max-w-md text-sm text-bg/70">
            New arrivals, care guides, and members-only offers. No noise.
          </p>

          {subscribed ? (
            <p className="mt-8 border border-bg/30 px-6 py-3 text-sm text-bg">
              Thank you — you are on the list.
            </p>
          ) : (
            <form
              className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSubscribed(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 border border-bg/30 bg-transparent px-4 py-3 text-sm text-bg outline-none placeholder:text-bg/40 focus:border-bg"
              />
              <button
                type="submit"
                className="border border-bg px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-bg transition-colors hover:bg-bg hover:text-primary"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
