export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
