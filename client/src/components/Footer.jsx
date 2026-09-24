import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'Wallets', to: '/shop?category=wallets' },
      { label: 'Bags', to: '/shop?category=bags' },
      { label: 'Belts', to: '/shop?category=belts' },
      { label: 'Card Holders', to: '/shop?category=card-holders' },
      { label: 'Laptop Bags', to: '/shop?category=laptop-bags' },
      { label: 'Accessories', to: '/shop?category=accessories' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Track Order', to: '/track-order' },
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/about#contact' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-primary text-bg">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="font-heading text-2xl font-bold">LEATHER-HUB</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-bg/60">
            Crafted for everyday. Built to last. Premium leather goods made with
            honest materials and old-school craftsmanship.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bg/50">
              {col.title}
            </p>
            <ul className="mt-4 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-bg/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bg/50">
            Contact
          </p>
          <ul className="mt-4 space-y-2 text-sm text-bg/80">
            <li>hello@leatherhub.com</li>
            <li>+91 98765 43210</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-bg/10 py-4 text-center text-xs text-bg/40">
        © {new Date().getFullYear()} Leather-Hub. All rights reserved.
      </div>
    </footer>
  );
}
