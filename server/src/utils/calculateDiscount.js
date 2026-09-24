/**
 * Discount always validated/calculated on the server — never client input.
 * @param coupon  Coupon document or null
 * @param subtotal number
 * @returns discount amount capped at subtotal
 */
export function calculateDiscount(coupon, subtotal) {
  if (!coupon) return 0;

  let discount = 0;
  if (coupon.type === "percent") {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.value;
  }

  return Math.max(0, Math.min(discount, subtotal));
}