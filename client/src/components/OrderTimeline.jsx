const STEP_LABELS = {
  ORDER_PLACED: 'Order Placed',
  PAYMENT_PENDING: 'Payment Submitted',
  PAYMENT_VERIFIED: 'Payment Verified',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

/**
 * Visual vertical timeline. `statusHistory` drives the events
 * (oldest → newest); the last entry is the current step.
 */
export default function OrderTimeline({ statusHistory = [], status }) {
  if (status === 'CANCELLED') {
    return (
      <div className="border border-line bg-white p-6">
        <p className="flex items-center gap-3 text-sm font-semibold text-red-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-700 text-xs text-white">✕</span>
          Order cancelled
        </p>
      </div>
    );
  }

  const steps = statusHistory?.length ? statusHistory : [{ status, at: null }];

  return (
    <ol className="relative space-y-6 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-line">
      {steps.map((step, index) => {
        const isCurrent = index === steps.length - 1;
        const label = STEP_LABELS[step.status] || step.status;
        const date = step.at ? new Date(step.at).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }) : '';

        return (
          <li key={`${step.status}-${index}`} className="relative flex gap-4 pl-0">
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white">
              {isCurrent ? (
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              ) : (
                <span className="text-xs text-primary">✓</span>
              )}
            </span>
            <div className="pt-1">
              <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-text/70'}`}>{label}</p>
              {date && <p className="text-xs text-muted">{date}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}