import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Plus,
  Check,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Tag,
  X,
  Sparkles,
  MapPin,
  Edit2,
  Trash2,
  Lock,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { addressApi, AddressItem, AddressInput } from "@/api/addressApi";
import { orderApi } from "@/api/orderApi";
import { paymentApi } from "@/api/paymentApi";
import { couponApi, PublicCoupon } from "@/api/couponApi";
import { payments, isPaymentConfigured } from "@/services/payments";
import { openRazorpay } from "@/lib/razorpay";
import { formatINR } from "@/lib/format";
import Seo from "@/components/Seo";
import CouponsModal from "@/components/CouponsModal";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Chandigarh",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
];

const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER ?? "917814477667";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const toast = useToast();
  const {
    lines,
    subtotal,
    discount,
    total,
    itemCount,
    coupon,
    couponMessage,
    applyCoupon,
    removeCoupon,
    clear,
    campaignDiscount,
    activeCampaign,
  } = useCart();

  // Contact email state (handles phone-only logged in users with placeholder emails)
  const isPlaceholderEmail = Boolean(user?.email && user.email.endsWith('@phone.aurex.in'));
  const [contactEmail, setContactEmail] = useState<string>(
    user?.email && !isPlaceholderEmail ? user.email : ""
  );

  useEffect(() => {
    if (user?.email && !user.email.endsWith('@phone.aurex.in')) {
      setContactEmail(user.email);
    }
  }, [user]);

  // Address state
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // New Address Form
  const [addressForm, setAddressForm] = useState<AddressInput>({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "Punjab",
    postalCode: "",
    country: "India",
    addressType: "HOME",
    isDefault: false,
  });

  // Billing address state
  const [useSameForBilling, setUseSameForBilling] = useState(true);
  const [billingForm, setBillingForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "Punjab",
    postalCode: "",
    country: "India",
  });

  // Additional order options
  const [addNote, setAddNote] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState<PublicCoupon[]>([]);

  // Order placing state
  const [placing, setPlacing] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Load user addresses
  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const list = await addressApi.getAddresses();
      setAddresses(list);
      if (list.length > 0) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        setSelectedAddressId(defaultAddr._id);
        setIsAddingNewAddress(false);
      } else {
        setIsAddingNewAddress(true);
      }
    } catch {
      setIsAddingNewAddress(true);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  // Load public coupons
  useEffect(() => {
    couponApi.getPublicCoupons().then(setPublicCoupons).catch(() => { });
  }, []);

  // Calculate pricing breakdown
  const mrpTotal = useMemo(() => {
    return lines.reduce((sum, l) => {
      const mrp = l.compareAtPrice && l.compareAtPrice > l.unitPrice ? l.compareAtPrice : l.unitPrice;
      return sum + mrp * l.quantity;
    }, 0);
  }, [lines]);

  const itemDiscount = useMemo(() => {
    return Math.max(0, mrpTotal - subtotal);
  }, [mrpTotal, subtotal]);

  const totalSavings = useMemo(() => {
    return itemDiscount + discount + campaignDiscount;
  }, [itemDiscount, discount, campaignDiscount]);

  // Find single best suggested coupon for current cart
  const suggestedCoupon: any = useMemo(() => {
    if (!publicCoupons || publicCoupons.length === 0 || coupon) return null;

    const eligible = publicCoupons
      .filter((c) => !c.minimumOrderValue || subtotal >= c.minimumOrderValue)
      .map((c) => {
        let savings = 0;
        if (c.discountType === "PERCENTAGE") {
          const raw = Math.round((subtotal * c.discountValue) / 100);
          savings = c.maximumDiscount ? Math.min(raw, c.maximumDiscount) : raw;
        } else {
          savings = Math.min(c.discountValue, subtotal);
        }
        return { ...c, savings, isEligible: true };
      })
      .sort((a, b) => (b.savings || 0) - (a.savings || 0));

    if (eligible.length > 0) return eligible[0];

    const closest = publicCoupons
      .filter((c) => (c.minimumOrderValue || 0) > subtotal)
      .map((c) => ({
        ...c,
        gap: (c.minimumOrderValue || 0) - subtotal,
        isEligible: false,
      }))
      .sort((a, b) => a.gap - b.gap);

    return closest.length > 0 ? closest[0] : null;
  }, [publicCoupons, subtotal, coupon]);

  // Handle coupon apply in summary
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponCodeInput.trim());
    setApplyingCoupon(false);
  };

  // Submit Order
  const handlePlaceOrder = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    if (lines.length === 0) {
      toast.error("Your cart is empty.");
      navigate("/shop");
      return;
    }

    setErrorMsg("");
    let targetAddressId = selectedAddressId;

    // If user is adding a new address or has no saved addresses, validate and create it first
    if (isAddingNewAddress || !targetAddressId) {
      if (!addressForm.fullName.trim()) {
        setErrorMsg("Please enter your full name for delivery.");
        return;
      }
      if (!addressForm.phone.trim() || addressForm.phone.length < 10) {
        setErrorMsg("Please enter a valid 10-digit phone number.");
        return;
      }
      if (!addressForm.addressLine1.trim()) {
        setErrorMsg("Please enter your street address.");
        return;
      }
      if (!addressForm.city.trim()) {
        setErrorMsg("Please enter your city.");
        return;
      }
      if (!addressForm.postalCode.trim() || addressForm.postalCode.length < 6) {
        setErrorMsg("Please enter a valid 6-digit postal PIN code.");
        return;
      }

      try {
        setPlacing(true);
        const created = await addressApi.createAddress({
          ...addressForm,
          isDefault: addresses.length === 0 ? true : addressForm.isDefault,
        });
        targetAddressId = created._id;
        await loadAddresses();
      } catch (err: any) {
        setPlacing(false);
        setErrorMsg(err.message || "Failed to save delivery address.");
        return;
      }
    }

    setPlacing(true);

    try {
      // 1. Create order on backend (in PENDING_PAYMENT status)
      const order = await orderApi.createOrder({
        addressId: targetAddressId,
        couponCode: coupon?.code,
        notes: addNote ? orderNote : undefined,
        email: contactEmail || undefined,
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          variantId: l.variantId,
        })),
      });

      // 2. Call backend to create real Razorpay Order
      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TULLOSxhCME7H3";
      const rzpOrder = await paymentApi.createRazorpayOrder(order._id);

      // 3. Open official Razorpay Checkout Modal
      await openRazorpay({
        key: rzpKey,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || "INR",
        order_id: rzpOrder.orderId,
        name: "Aurex India",
        description: `${itemCount} item(s) · Order #${order.orderNumber}`,
        prefill: {
          name: user.fullName || addressForm.fullName,
          email: contactEmail || (!isPlaceholderEmail ? user.email : undefined),
          contact: user.phone || addressForm.phone,
        },
        theme: { color: "#1B2A4A" },
        handler: async (resp) => {
          try {
            // 4. Verify payment signature on backend
            const verifyRes = await paymentApi.verifyPayment({
              razorpay_order_id: resp.razorpay_order_id || rzpOrder.orderId,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature || "",
            });

            if (verifyRes.success) {
              setPlacedOrderId(order.orderNumber);
              clear();
            } else {
              setErrorMsg("Payment verification could not be completed. Please contact support.");
            }
          } catch (vErr: any) {
            setErrorMsg(vErr.message || "Payment verification failed.");
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast.info("Payment cancelled. You can complete your order anytime from My Orders.");
          },
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate payment. Please check your connection.");
      setPlacing(false);
    }
  };

  // Success view
  if (placedOrderId) {
    return (
      <div className="container-x py-16">
        <Seo title="Order Confirmed - Aurex India" noindex />
        <div className="mx-auto max-w-lg card p-8 sm:p-10 text-center animate-fade-up">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest/10 text-forest mb-4">
            <Check size={32} />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-copper">Order Placed</span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-ink">Thank you for your order!</h1>
          <p className="mt-3 text-sm text-ink/60 leading-relaxed">
            Your order <strong className="font-semibold text-ink">{placedOrderId}</strong> has been received and is being prepared.
            A confirmation has been sent to <span className="font-medium text-ink">{user?.email}</span>.
          </p>
          <div className="mt-6 rounded-xl bg-sand/40 p-4 text-xs text-ink/70">
            💬 Our customer support team will share real-time delivery updates directly on WhatsApp.
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/account" className="btn-primary">
              View Order Details
            </Link>
            <Link to="/shop" className="btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart empty
  if (lines.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <Seo title="Checkout - Aurex India" noindex />
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sand">
          <Truck className="text-ink/40" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-ink/60">Add some of our artisan cookware before checking out.</p>
        <Link to="/shop" className="btn-copper mt-6">
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-6 sm:py-10 max-w-full overflow-x-hidden">
      <Seo title="Secure Checkout - Aurex India" noindex />

      {/* Top Breadcrumb Header */}
      <div className="mb-5 sm:mb-6 flex items-center justify-between border-b border-ink/10 pb-3 sm:pb-4 text-xs">
        <Link to="/cart" className="flex items-center gap-1 font-semibold text-ink/60 hover:text-copper transition-colors">
          <ChevronLeft size={15} /> Return to Cart
        </Link>
        <div className="flex items-center gap-1.5 text-ink/50 font-medium">
        </div>
      </div>

      <div className="grid gap-6 lg:gap-10 lg:grid-cols-[1fr_420px] items-start">
        {/* Left Column: Checkout Forms */}
        <div className="space-y-6 sm:space-y-8 min-w-0 self-start">
          {/* 1. Contact Information */}
          <section className="card p-4 sm:p-6 rounded-2xl w-full max-w-full overflow-hidden">
            <h2 className="text-sm sm:text-base font-bold text-ink mb-3 sm:mb-4 flex items-center justify-between">
              <span>Contact Information</span>
              {user && <span className="text-[11px] sm:text-xs font-normal text-ink/50">Logged in</span>}
            </h2>
            <div>
              <label className="block text-xs font-semibold text-ink/70 mb-1.5">
                Email Address {isPlaceholderEmail || !user?.email ? <span className="text-copper font-normal">* (For invoice & delivery tracking)</span> : null}
              </label>
              <input
                type="email"
                value={isPlaceholderEmail || !user?.email ? contactEmail : (user?.email || "")}
                onChange={(e) => setContactEmail(e.target.value)}
                disabled={!isPlaceholderEmail && Boolean(user?.email)}
                placeholder="Enter email to receive order invoice"
                className={`input text-xs sm:text-sm ${
                  !isPlaceholderEmail && Boolean(user?.email) ? "bg-sand/30 text-ink/70 cursor-not-allowed" : "bg-white text-ink focus:border-copper"
                }`}
              />
              <p className="mt-1.5 text-[11px] text-ink/45">
                {isPlaceholderEmail || !user?.email
                  ? "Enter your email to receive order confirmation, GST invoice & live tracking updates."
                  : "Order confirmation and invoice will be sent here."}
              </p>
            </div>
          </section>

          {/* 2. Shipping Address */}
          <section className="card p-4 sm:p-6 rounded-2xl w-full max-w-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 gap-2">
              <h2 className="text-sm sm:text-base font-bold text-ink flex items-center gap-2">
                <MapPin size={17} className="text-copper flex-shrink-0" /> Shipping Address
              </h2>
              {addresses.length > 0 && !isAddingNewAddress && (
                <button
                  type="button"
                  onClick={() => {
                    setAddressForm({
                      fullName: user?.fullName || "",
                      phone: user?.phone || "",
                      addressLine1: "",
                      addressLine2: "",
                      landmark: "",
                      city: "",
                      state: "Punjab",
                      postalCode: "",
                      country: "India",
                      addressType: "HOME",
                      isDefault: false,
                    });
                    setIsAddingNewAddress(true);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-copper hover:underline flex-shrink-0"
                >
                  <Plus size={14} /> Add New
                </button>
              )}
            </div>

            {/* Saved Addresses Selector */}
            {addresses.length > 0 && !isAddingNewAddress && (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`cursor-pointer rounded-2xl border p-3.5 sm:p-4 transition-all ${isSelected
                        ? "border-copper bg-copper/[0.03] shadow-sm ring-1 ring-copper"
                        : "border-ink/10 hover:border-ink/25 bg-white"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                          <input
                            type="radio"
                            name="shippingAddress"
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(addr._id)}
                            className="h-4 w-4 text-copper focus:ring-copper flex-shrink-0"
                          />
                          <span className="font-bold text-xs sm:text-sm text-ink">{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="bg-forest/10 text-forest text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                          {addr.addressType && (
                            <span className="bg-sand text-ink/60 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                              {addr.addressType}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] sm:text-xs font-semibold text-ink/60 flex-shrink-0 pl-6 sm:pl-0">+91 {addr.phone}</span>
                      </div>
                      <p className="mt-2 text-xs text-ink/70 pl-6 leading-relaxed">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                        {addr.landmark ? `, Near ${addr.landmark}` : ""}
                        <br />
                        {addr.city}, {addr.state} - <strong className="text-ink">{addr.postalCode}</strong>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inline New Address Form */}
            {isAddingNewAddress && (
              <div className="space-y-4 pt-1 animate-fade-up">
                {addresses.length > 0 && (
                  <div className="flex items-center justify-between pb-2 border-b border-ink/5">
                    <span className="text-xs font-semibold text-ink/60">Enter new delivery details</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="text-xs text-ink/50 hover:text-ink font-medium"
                    >
                      Cancel & use saved address
                    </button>
                  </div>
                )}

                {/* Country */}
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Country / Region</label>
                  <select
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="input"
                  >
                    <option value="India">India</option>
                  </select>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink/70 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink/70 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink/40">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="98765 43210"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, "") })}
                        className="input pl-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">
                    Street Address / House No. / Flat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="House No. 12, Park View Heights, Main Road"
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                    className="input"
                  />
                </div>

                {/* Apartment / Landmark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink/70 mb-1">Apartment / Suite (Optional)</label>
                    <input
                      type="text"
                      placeholder="Floor 4, Block B"
                      value={addressForm.addressLine2 || ""}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink/70 mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="Near City Mall"
                      value={addressForm.landmark || ""}
                      onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                {/* City, State, PIN Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink/70 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Amritsar"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink/70 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="input"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink/70 mb-1">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="143001"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value.replace(/\D/g, "") })}
                      className="input"
                    />
                  </div>
                </div>

                {/* Address Type & Default */}
                <div className="flex flex-wrap items-center justify-between pt-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink/60">Type:</span>
                    {(["HOME", "WORK", "OTHER"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddressForm({ ...addressForm, addressType: type })}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${addressForm.addressType === type
                          ? "bg-copper text-white border-copper"
                          : "border-ink/15 text-ink/60 hover:border-ink/40"
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-xs text-ink/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="rounded border-ink/20 text-copper focus:ring-copper"
                    />
                    <span>Set as default address</span>
                  </label>
                </div>
              </div>
            )}

            {/* Use same address for billing */}
            <div className="mt-5 border-t border-ink/10 pt-4">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-ink/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSameForBilling}
                  onChange={(e) => setUseSameForBilling(e.target.checked)}
                  className="rounded border-ink/20 text-copper focus:ring-copper h-4 w-4"
                />
                <span>Use same address for billing</span>
              </label>

              {/* Billing Address Form if unchecked */}
              {!useSameForBilling && (
                <div className="mt-4 space-y-3 pl-6 border-l-2 border-copper/30 animate-fade-up">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink/60">Billing Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={billingForm.fullName}
                      onChange={(e) => setBillingForm({ ...billingForm, fullName: e.target.value })}
                      className="input"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={billingForm.phone}
                      onChange={(e) => setBillingForm({ ...billingForm, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={billingForm.addressLine1}
                    onChange={(e) => setBillingForm({ ...billingForm, addressLine1: e.target.value })}
                    className="input"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={billingForm.city}
                      onChange={(e) => setBillingForm({ ...billingForm, city: e.target.value })}
                      className="input"
                    />
                    <select
                      value={billingForm.state}
                      onChange={(e) => setBillingForm({ ...billingForm, state: e.target.value })}
                      className="input"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="PIN Code"
                      maxLength={6}
                      value={billingForm.postalCode}
                      onChange={(e) => setBillingForm({ ...billingForm, postalCode: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Payment Options */}
          <section className="card p-4 sm:p-6 rounded-2xl w-full max-w-full overflow-hidden">
            <h2 className="text-sm sm:text-base font-bold text-ink mb-3 flex items-center gap-2">
              <CreditCard size={17} className="text-copper flex-shrink-0" /> Payment Options
            </h2>
            <div className="space-y-3">
              <label
                onClick={() => setPaymentMethod("razorpay")}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 sm:p-4 transition-all ${paymentMethod === "razorpay"
                  ? "border-copper bg-copper/[0.03] ring-1 ring-copper"
                  : "border-ink/10 hover:border-ink/20"
                  }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="h-4 w-4 mt-0.5 text-copper focus:ring-copper flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-ink">Online Payment (Razorpay)</span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded">Fast & Secure</span>
                  </div>
                  <p className="mt-1 text-xs text-ink/55 leading-relaxed">
                    Pay securely via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, or Netbanking.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* 5. Additional Order Information */}
          <section className="card p-4 sm:p-6 rounded-2xl w-full max-w-full overflow-hidden">
            <h2 className="text-sm sm:text-base font-bold text-ink mb-3">Additional Information</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 text-xs text-ink/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addNote}
                  onChange={(e) => setAddNote(e.target.checked)}
                  className="rounded border-ink/20 text-copper focus:ring-copper h-4 w-4 flex-shrink-0"
                />
                <span>Add delivery instructions or a note to your order</span>
              </label>

              {addNote && (
                <textarea
                  rows={2}
                  placeholder="e.g. Please leave package at security gate or call before delivery..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="input resize-none text-xs animate-fade-up w-full"
                />
              )}
            </div>
          </section>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-600 text-center animate-fade-up">
              {errorMsg}
            </div>
          )}

          {/* Bottom CTA for Mobile */}
          <div className="lg:hidden">
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="btn-primary w-full py-4 text-base shadow-lift font-bold rounded-2xl"
            >
              {placing ? "Processing Order..." : `Place Order · ${formatINR(total)}`}
            </button>
          </div>
        </div>

        {/* Right Column: Sticky Order Summary */}
        <aside className="h-fit min-w-0 self-start lg:sticky lg:top-20">
          <div className="card p-4 sm:p-6 rounded-2xl shadow-sm w-full max-w-full overflow-hidden">
            <h2 className="text-sm sm:text-base font-bold text-ink pb-3 sm:pb-4 border-b border-ink/10 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-normal text-ink/50">{itemCount} item(s)</span>
            </h2>

            {/* Item Thumbnails List */}
            <div className="mt-4 max-h-[300px] overflow-y-auto space-y-3.5 pr-1">
              {lines.map((l) => (
                <div key={`${l.productId}-${l.variantId ?? ""}`} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-xl bg-sand/40 border border-ink/5">
                    <img src={l.image} alt={l.name} className="h-full w-full object-cover" />
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-white shadow-sm">
                      {l.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="line-clamp-1 text-xs font-bold text-ink">{l.name}</h4>
                    {l.variantName && <p className="text-[10px] text-ink/50 mt-0.5">{l.variantName}</p>}
                    {l.compareAtPrice && l.compareAtPrice > l.unitPrice && (
                      <span className="text-[10px] font-bold text-forest">
                        Save {formatINR((l.compareAtPrice - l.unitPrice) * l.quantity)}
                      </span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-ink">{formatINR(l.unitPrice * l.quantity)}</p>
                    {l.compareAtPrice && l.compareAtPrice > l.unitPrice && (
                      <p className="text-[10px] text-ink/35 line-through">{formatINR(l.compareAtPrice * l.quantity)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="mt-5 border-t border-ink/10 pt-4 space-y-3">
              {/* Suggested / Best Coupon Banner */}
              {!coupon && suggestedCoupon && (
                <div
                  className={`p-3 rounded-2xl border transition-all w-full min-w-0 overflow-hidden ${suggestedCoupon.isEligible
                    ? "bg-gradient-to-r from-copper/10 via-sand/30 to-amber-500/5 border-copper/30 shadow-2xs"
                    : "bg-sand/20 border-ink/10"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono text-[11px] sm:text-xs font-black text-ink bg-white border border-dashed border-copper/50 px-1.5 sm:px-2 py-0.5 rounded-lg shadow-2xs flex-shrink-0">
                        {suggestedCoupon.code}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] sm:text-xs font-bold text-ink truncate">
                          {suggestedCoupon.isEligible
                            ? `Save ${formatINR(suggestedCoupon.savings)}`
                            : `Add ${formatINR(suggestedCoupon.gap)} to unlock`}
                        </p>
                        <p className="text-[10px] text-ink/50 truncate">
                          {suggestedCoupon.isEligible ? "Best deal" : "Special discount"}
                        </p>
                      </div>
                    </div>

                    {suggestedCoupon.isEligible ? (
                      <button
                        type="button"
                        onClick={() => {
                          setApplyingCoupon(true);
                          applyCoupon(suggestedCoupon.code).finally(() => setApplyingCoupon(false));
                        }}
                        disabled={applyingCoupon}
                        className="text-[11px] sm:text-xs font-black uppercase text-white bg-copper hover:bg-copper-dark px-2.5 sm:px-3 py-1.5 rounded-xl shadow-2xs transition-all flex-shrink-0 active:scale-95 cursor-pointer"
                      >
                        {applyingCoupon ? "…" : "Apply"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowCouponsModal(true)}
                        className="text-xs font-bold text-copper hover:underline flex-shrink-0"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Form / Active Badge */}
              {coupon ? (
                <div className="flex items-center justify-between rounded-xl bg-forest/10 border border-forest/20 px-3.5 py-2 text-xs text-forest font-medium">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Tag size={13} /> {coupon.code} Applied
                  </span>
                  <button onClick={removeCoupon} aria-label="Remove coupon" className="hover:opacity-75">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2 w-full min-w-0">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="input text-xs font-mono uppercase py-2 min-w-0 flex-1"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon}
                    className="btn-outline whitespace-nowrap px-3 sm:px-4 py-2 text-xs font-bold flex-shrink-0"
                  >
                    {applyingCoupon ? "…" : "Apply"}
                  </button>
                </form>
              )}

              {couponMessage && (
                <p className={`text-xs ${coupon ? "text-forest" : "text-red-600"}`}>{couponMessage}</p>
              )}

              {/* View Available Coupons button */}
              {!coupon && publicCoupons.length > 0 && (
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowCouponsModal(true)}
                    className="flex items-center gap-1 text-xs font-bold text-copper hover:underline w-full justify-center"
                  >
                    <Tag size={11} /> View all available coupons ({publicCoupons.length}) →
                  </button>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <dl className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-xs">
              {itemDiscount > 0 ? (
                <>
                  <div className="flex justify-between text-ink/60">
                    <dt>Total MRP</dt>
                    <dd className="line-through">{formatINR(mrpTotal)}</dd>
                  </div>
                  <div className="flex justify-between text-forest font-medium">
                    <dt>Discount on MRP</dt>
                    <dd>−{formatINR(itemDiscount)}</dd>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-ink/60">
                  <dt>Subtotal</dt>
                  <dd>{formatINR(subtotal)}</dd>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-forest font-medium">
                  <dt>Coupon Discount</dt>
                  <dd>−{formatINR(discount)}</dd>
                </div>
              )}

              {campaignDiscount > 0 && (
                <div className="flex justify-between text-forest font-medium">
                  <dt>Promo ({activeCampaign?.name})</dt>
                  <dd>−{formatINR(campaignDiscount)}</dd>
                </div>
              )}

              <div className="flex justify-between text-ink/60">
                <dt>Delivery</dt>
                <dd className="text-forest font-bold">FREE</dd>
              </div>

              <div className="flex justify-between border-t border-ink/10 pt-3 text-sm font-bold text-ink">
                <dt>Total Amount</dt>
                <dd className="text-base text-copper">{formatINR(total)}</dd>
              </div>

              {totalSavings > 0 && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-forest/[0.06] border border-forest/15 px-3 py-2 text-xs text-forest">
                  <div className="flex items-center gap-1.5 font-medium">
                    <div className="grid h-4 w-4 place-items-center rounded-full bg-forest/15 text-forest">
                      <Sparkles size={10} />
                    </div>
                    <span>Total Savings</span>
                  </div>
                  <span className="font-bold">{formatINR(totalSavings)}</span>
                </div>
              )}
            </dl>

            {/* Desktop Place Order Button */}
            <div className="mt-6 hidden lg:block">
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="btn-primary w-full py-3.5 text-sm shadow-lift font-bold cursor-fork active:scale-[0.98]"
              >
                {placing ? "Processing Order..." : `Place Order · ${formatINR(total)}`}
              </button>
              <p className="mt-3 text-center text-[11px] text-ink/45">
                By placing your order, you agree to our Terms & Privacy Policy.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Luxury Available Coupons Modal */}
      <CouponsModal
        isOpen={showCouponsModal}
        onClose={() => setShowCouponsModal(false)}
        coupons={publicCoupons}
        appliedCouponCode={coupon?.code}
        subtotal={subtotal}
        onApplyCoupon={async (code) => {
          return await applyCoupon(code);
        }}
        onRemoveCoupon={removeCoupon}
      />
    </div>
  );
}
