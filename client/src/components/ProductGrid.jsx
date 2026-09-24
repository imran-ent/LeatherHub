import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products }) {
  if (!products?.length) {
    return (
      <div className="border border-line bg-white px-6 py-16 text-center">
        <p className="font-heading text-xl text-primary">No products found</p>
        <p className="mt-2 text-sm text-muted">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
