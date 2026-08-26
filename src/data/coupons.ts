import type { Coupon, CouponResult } from "@/services/types";

/** Sample coupons for the mock backend. Move to a DB table when the MERN
 *  backend lands — the shapes already match src/services/types.ts. */
export const coupons: Coupon[] = [
  {
    code: "WELCOME15",
    label: "15% off your first order",
    type: "percent",
    value: 15,
    maxDiscount: 750,
  },
  {
    code: "AUREX10",
    label: "10% off, no minimum",
    type: "percent",
    value: 10,
    maxDiscount: 1000,
  },
  {
    code: "FLAT200",
    label: "₹200 off orders over ₹1,999",
    type: "flat",
    value: 200,
    minSubtotal: 1999,
  },
  {
    code: "COMBO500",
    label: "₹500 off combos over ₹4,999",
    type: "flat",
    value: 500,
    minSubtotal: 4999,
  },
];

/** Pure, framework-agnostic discount computation — the single source of truth
 *  for how a coupon applies. Reused by every adapter. */
export function computeDiscount(
  code: string,
  subtotal: number,
  list: Coupon[]
): CouponResult {
  const coupon = list.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
  if (!coupon) {
    return { ok: false, discount: 0, message: "That coupon code isn't valid." };
  }
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      discount: 0,
      message: `Add more to reach the ₹${coupon.minSubtotal.toLocaleString("en-IN")} minimum for ${coupon.code}.`,
    };
  }
  let discount =
    coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal);
  return {
    ok: true,
    coupon,
    discount,
    message: `${coupon.code} applied — you saved ₹${discount.toLocaleString("en-IN")}.`,
  };
}
