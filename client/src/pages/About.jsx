import usePageTitle from '../hooks/usePageTitle.js';

export default function About() {
  usePageTitle('About Us');
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-muted">About us</p>
      <h1 className="mt-3 font-heading text-4xl text-primary">Built for the long run</h1>

      <div className="mt-8 space-y-6 leading-relaxed text-text/80">
        <p>
          Leather-Hub is a small leather goods studio. We believe your wallet, belt
          and bag are the things you reach for every single day — so they deserve
          to be made properly.
        </p>
        <p>
          We use full-grain and genuine leathers from trusted tanneries, cut
          patterns with minimal waste, and stitch every piece by hand. There are no
          shortcuts in what we make.
        </p>
        <p>
          Our aim is simple: products that earn their character over time, at
          prices that stay honest. If you take care of a Leather-Hub piece, it will
          take care of you for years.
        </p>
      </div>

      <div id="contact" className="mt-14 border-t border-line pt-10">
        <h2 className="font-heading text-2xl text-primary">Contact</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li>Email: hello@leatherhub.com</li>
          <li>Phone: +91 98765 43210</li>
          <li>Hours: Mon–Sat, 10:00 – 19:00 IST</li>
        </ul>
      </div>
    </div>
  );
}
