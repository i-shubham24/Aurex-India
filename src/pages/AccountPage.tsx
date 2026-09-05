import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  Package,
  User as UserIcon,
  ShieldCheck,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Truck,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Box,
  FileText,
  Printer,
  Tag,
  Star,
  Camera,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addressApi, AddressItem, AddressInput } from "@/api/addressApi";
import { orderApi, BackendOrder } from "@/api/orderApi";
import { paymentApi } from "@/api/paymentApi";
import { shippingApi } from "@/api/shippingApi";
import { createReview, getMyReviews, uploadReviewImage, type ReviewImage } from "@/api/reviewApi";
import { openRazorpay } from "@/lib/razorpay";
import { useAsync } from "@/lib/useAsync";
import { formatINR } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import Seo from "@/components/Seo";
import PaymentProcessingOverlay, { PaymentStage } from "@/components/PaymentProcessingOverlay";

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

const statusStyle: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  PENDING_PAYMENT: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  packed: "bg-indigo-100 text-indigo-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  READY_TO_SHIP: "bg-purple-100 text-purple-700",
  shipped: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  delivered: "bg-forest/10 text-forest",
  DELIVERED: "bg-forest/10 text-forest",
  cancelled: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const TRACKING_STEPS = [
  { key: "PLACED", label: "Placed", icon: Package },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "PROCESSING", label: "Packed", icon: Box },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Check },
];

function getActiveStepIndex(status: string): number {
  switch (status) {
    case "PENDING_PAYMENT":
      return 0;
    case "CONFIRMED":
      return 1;
    case "PROCESSING":
      return 2;
    case "READY_TO_SHIP":
    case "SHIPPED":
      return 3;
    case "DELIVERED":
      return 4;
    default:
      return 1;
  }
}

function OrderCardSkeleton() {
  return (
    <div className="card p-5 space-y-4 animate-pulse border border-ink/5 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink/5 pb-3">
        <div className="space-y-1.5">
          <div className="h-4 w-36 bg-sand/60 rounded-md" />
          <div className="h-3 w-24 bg-sand/40 rounded-md" />
        </div>
        <div className="h-6 w-24 bg-sand/50 rounded-full" />
      </div>

      {/* Items */}
      <div className="space-y-3 py-1">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-sand/60 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-44 bg-sand/60 rounded-md" />
            <div className="h-3 w-20 bg-sand/40 rounded-md" />
          </div>
          <div className="h-4 w-16 bg-sand/50 rounded-md" />
        </div>
      </div>

      {/* Stepper Skeleton */}
      <div className="rounded-2xl bg-sand/20 p-4">
        <div className="flex items-center justify-between px-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="h-7 w-7 rounded-full bg-sand/60" />
              <div className="h-2.5 w-10 bg-sand/40 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-ink/5 pt-3">
        <div className="h-3 w-32 bg-sand/40 rounded-md" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-sand/60 rounded-md" />
          <div className="h-7 w-24 bg-sand/50 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function AddressCardSkeleton() {
  return (
    <div className="card p-5 flex flex-col justify-between space-y-4 animate-pulse border border-ink/5 bg-white">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-sand/60 rounded-md" />
          <div className="h-4 w-12 bg-sand/40 rounded-full" />
        </div>
        <div className="h-3 w-24 bg-sand/40 rounded-md" />
        <div className="space-y-1.5 pt-1">
          <div className="h-3 w-full bg-sand/40 rounded-md" />
          <div className="h-3 w-3/4 bg-sand/40 rounded-md" />
          <div className="h-3 w-1/2 bg-sand/40 rounded-md" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-ink/5 pt-3">
        <div className="h-3 w-20 bg-sand/40 rounded-md" />
        <div className="flex gap-3">
          <div className="h-3 w-10 bg-sand/50 rounded-md" />
          <div className="h-3 w-12 bg-sand/50 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses">("orders");

  // Address state
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<AddressItem | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState(false);

  // Tracking & Invoice state
  const [trackingOrder, setTrackingOrder] = useState<BackendOrder | null>(null);
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<BackendOrder | null>(null);

  // Product Review State
  const [reviewingItem, setReviewingItem] = useState<{
    productId: string;
    productName: string;
    productImage?: string;
    orderId?: string;
  } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [accountReviewImages, setAccountReviewImages] = useState<ReviewImage[]>([]);
  const [isUploadingAccountPhoto, setIsUploadingAccountPhoto] = useState(false);
  const accountFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAccountFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (accountReviewImages.length + files.length > 4) {
      toast.error("You can upload up to 4 photos per review.");
      return;
    }

    setIsUploadingAccountPhoto(true);
    try {
      const uploaded: ReviewImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB).`);
          continue;
        }
        const res = await uploadReviewImage(file);
        if (res?.url) {
          uploaded.push(res);
        }
      }
      setAccountReviewImages((prev) => [...prev, ...uploaded]);
      if (uploaded.length > 0) {
        toast.success(`${uploaded.length} photo(s) added!`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload photo.");
    } finally {
      setIsUploadingAccountPhoto(false);
      if (accountFileInputRef.current) {
        accountFileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAccountPhoto = (index: number) => {
    setAccountReviewImages((prev) => prev.filter((_, i) => i !== index));
  };
  const [localReviewedIds, setLocalReviewedIds] = useState<string[]>([]);

  useEffect(() => {
    // Purge legacy un-scoped global key to prevent cross-user contamination
    try {
      localStorage.removeItem("aurex_reviewed_products");
    } catch {}

    const uid = user?.id || (user as any)?._id;
    if (uid) {
      try {
        const stored = JSON.parse(localStorage.getItem(`aurex_reviewed_products_${uid}`) || "[]");
        setLocalReviewedIds(Array.isArray(stored) ? stored : []);
      } catch {
        setLocalReviewedIds([]);
      }
    } else {
      setLocalReviewedIds([]);
    }
  }, [user?.id, (user as any)?._id]);

  const queryClient = useQueryClient();
  const activeUserId = user?.id || (user as any)?._id;
  const { data: myReviewsData } = useQuery({
    queryKey: ['my-reviews', activeUserId],
    queryFn: getMyReviews,
    enabled: !!user,
  });

  const backendReviewedIds = myReviewsData?.reviewedProductIds || [];
  const reviewedProductIds = Array.from(new Set([...backendReviewedIds, ...localReviewedIds]));

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingItem) return;
    setIsSubmittingReview(true);
    try {
      await createReview({
        productId: reviewingItem.productId,
        orderId: reviewingItem.orderId,
        rating: reviewRating,
        title: reviewTitle.trim() || `${reviewRating} Star Review`,
        comment: reviewComment.trim() || "Excellent cookware! Heats evenly and very durable.",
        images: accountReviewImages,
      });
      toast.success("⭐ Thank you! Your product review and rating are now live.");
      const updated = Array.from(new Set([...localReviewedIds, reviewingItem.productId]));
      setLocalReviewedIds(updated);
      const currentUid = user?.id || (user as any)?._id;
      if (currentUid) {
        localStorage.setItem(`aurex_reviewed_products_${currentUid}`, JSON.stringify(updated));
      }
      queryClient.setQueryData(['my-reviews', currentUid], (old: any) => {
        if (!old) return { reviews: [], reviewedProductIds: [reviewingItem.productId] };
        return {
          ...old,
          reviewedProductIds: Array.from(new Set([...(old.reviewedProductIds || []), reviewingItem.productId])),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setReviewingItem(null);
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      setAccountReviewImages([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleOpenTracking = async (order: BackendOrder) => {
    setTrackingOrder(order);
    setTrackingData(null);
    if (order.shipping?.awbCode) {
      try {
        setLoadingTracking(true);
        const data = await shippingApi.trackByAwb(order.shipping.awbCode);
        setTrackingData(data);
      } catch (err: any) {
        console.error("Tracking fetch error", err);
      } finally {
        setLoadingTracking(false);
      }
    }
  };

  const [addressForm, setAddressForm] = useState<AddressInput>({
    fullName: "",
    phone: "",
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

  // Orders state
  const [backendOrders, setBackendOrders] = useState<BackendOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [payingOrder, setPayingOrder] = useState<BackendOrder | null>(null);
  const [payingStage, setPayingStage] = useState<PaymentStage>("initiating");
  const [cancellingOrder, setCancellingOrder] = useState<BackendOrder | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load user data
  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const list = await addressApi.getAddresses();
      setAddresses(list);
    } catch {
      // ignore
    } finally {
      setLoadingAddresses(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const list = await orderApi.getOrders();
      setBackendOrders(list);
    } catch {
      // Fallback
    } finally {
      setLoadingOrders(false);
    }
  };

  const handlePayPendingOrder = async (order: BackendOrder) => {
    setPayingOrder(order);
    setPayingStage("initiating");
    try {
      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TULLOSxhCME7H3";
      const rzpOrder = await paymentApi.createRazorpayOrder(order._id);

      setPayingStage("waiting");
      await openRazorpay({
        key: rzpKey,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || "INR",
        order_id: rzpOrder.orderId,
        name: "Aurex India",
        description: `Order #${order.orderNumber}`,
        prefill: {
          name: order.shippingAddress?.fullName || user?.fullName,
          email: user?.email,
          contact: order.shippingAddress?.phone || user?.phone,
        },
        theme: { color: "#1B2A4A" },
        handler: async (resp) => {
          setPayingStage("verifying");
          try {
            const verifyRes = await paymentApi.verifyPayment({
              razorpay_order_id: resp.razorpay_order_id || rzpOrder.orderId,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature || "",
            });

            if (verifyRes.success) {
              toast.success("Payment successful! Order confirmed.");
              await loadOrders();
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (vErr: any) {
            toast.error(vErr.message || "Payment verification failed.");
          } finally {
            setPayingOrder(null);
          }
        },
        modal: {
          ondismiss: () => {
            setPayingOrder(null);
            toast.info("Payment cancelled.");
          },
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment.");
      setPayingOrder(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    try {
      setIsCancelling(true);
      await orderApi.cancelOrder(cancellingOrder._id);
      toast.success(`Order #${cancellingOrder.orderNumber} has been cancelled.`);
      setCancellingOrder(null);
      await loadOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to cancel order.");
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAddresses();
      loadOrders();
    }
  }, [user]);

  async function logout() {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Sign out failed", err);
    }
  }

  // Address Handlers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
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
      isDefault: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr: AddressItem) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      landmark: addr.landmark || "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country || "India",
      addressType: addr.addressType || "HOME",
      isDefault: !!addr.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName.trim() || !addressForm.phone.trim() || !addressForm.addressLine1.trim()) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    try {
      setSavingAddress(true);
      if (editingAddressId) {
        await addressApi.updateAddress(editingAddressId, addressForm);
        toast.success("Address updated successfully!");
      } else {
        await addressApi.createAddress(addressForm);
        toast.success("Address added successfully!");
      }
      setShowAddressModal(false);
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || "Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await addressApi.deleteAddress(id);
      toast.success("Address deleted.");
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete address.");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await addressApi.setDefaultAddress(id);
      toast.success("Default address updated.");
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || "Failed to set default address.");
    }
  };

  if (!user) return null;

  return (
    <div className="container-x py-10">
      <Seo title="My Account - Aurex India" noindex />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-copper">Customer Profile</span>
          <h1 className="text-3xl font-bold text-ink mt-0.5">My Account</h1>
          <p className="mt-1 text-sm text-ink/60">Welcome back, {user.fullName || user.email}.</p>
        </div>
        <div className="flex gap-2.5">
          {isAdmin && (
            <Link to="/admin" className="btn-copper text-xs">
              <ShieldCheck size={15} /> Admin Panel
            </Link>
          )}
          <button onClick={logout} className="btn-outline text-xs">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Left Sidebar / Profile Card */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-copper/10 text-copper">
                <UserIcon size={22} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-ink truncate">{user.fullName || "Aurex Customer"}</p>
                <p className="text-xs text-ink/50 capitalize">{user.role}</p>
              </div>
            </div>
            <dl className="mt-5 space-y-3 text-xs border-t border-ink/5 pt-4">
              <div>
                <dt className="text-ink/45 font-medium">Email Address</dt>
                <dd className="font-semibold text-ink mt-0.5 break-all">{user.email}</dd>
              </div>
              {user.phone && (
                <div>
                  <dt className="text-ink/45 font-medium">Phone</dt>
                  <dd className="font-semibold text-ink mt-0.5">+91 {user.phone}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Navigation Tabs */}
          <div className="card p-2 space-y-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold transition-all ${activeTab === "orders"
                  ? "bg-copper text-white shadow-sm"
                  : "text-ink/70 hover:bg-sand/40 hover:text-ink"
                }`}
            >
              <Package size={16} />
              <span>My Orders</span>
              {backendOrders.length > 0 && (
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${activeTab === "orders" ? "bg-white/20 text-white" : "bg-sand text-ink/70"}`}>
                  {backendOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold transition-all ${activeTab === "addresses"
                  ? "bg-copper text-white shadow-sm"
                  : "text-ink/70 hover:bg-sand/40 hover:text-ink"
                }`}
            >
              <MapPin size={16} />
              <span>Saved Addresses</span>
              {addresses.length > 0 && (
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${activeTab === "addresses" ? "bg-white/20 text-white" : "bg-sand text-ink/70"}`}>
                  {addresses.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Main Content */}
        <div>
          {/* Tab 1: Orders */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                  <Package size={20} className="text-copper" /> Order History
                </h2>
              </div>

              {loadingOrders ? (
                <div className="space-y-4">
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                </div>
              ) : backendOrders.length > 0 ? (
                <div className="space-y-4">
                  {backendOrders.map((o) => (
                    <div key={o._id} className="card p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/5 pb-3">
                        <div>
                          <p className="font-bold text-sm text-ink">Order #{o.orderNumber}</p>
                          <p className="text-xs text-ink/45 mt-0.5">
                            Placed on{" "}
                            {new Date(o.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {o.payment?.method === "PARTIAL_COD" && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              {o.orderStatus === "PENDING_PAYMENT" || (o.payment?.paidAmount || 0) === 0
                                ? `Advance Due · ${formatINR(o.pricing?.advanceAmount || 149)}`
                                : o.payment?.isCodSettled
                                ? "COD Settled"
                                : `Advance Paid · Due ${formatINR(o.payment?.remainingCodAmount || o.pricing?.codAmount || 0)} COD`}
                            </span>
                          )}
                          <span className={`chip text-xs font-bold uppercase tracking-wider ${statusStyle[o.orderStatus] || "bg-sand text-ink"}`}>
                            {o.orderStatus.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mt-4 space-y-3">
                        {o.items.map((item, idx) => {
                          const prodId = typeof item.product === 'object' && item.product !== null ? (item.product as any)._id : item.product;
                          const isReviewed =
                            (prodId && backendReviewedIds.includes(prodId)) ||
                            (prodId && backendReviewedIds.some((id) => id?.toString() === prodId?.toString())) ||
                            (prodId && reviewedProductIds.includes(prodId));

                          return (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-sand/15 border border-ink/5">
                              <div className="flex items-center gap-3 min-w-0">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-12 w-12 rounded-lg object-cover bg-sand/30 border border-ink/5 flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-ink truncate">{item.name}</p>
                                  <p className="text-[11px] text-ink/50">Qty: {item.quantity} × {formatINR(item.unitPrice)}</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-ink/5">
                                <span className="text-xs font-bold text-ink">{formatINR(item.total)}</span>

                                {o.orderStatus === "DELIVERED" && (
                                  <div>
                                    {isReviewed ? (
                                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-forest bg-forest/10 px-2.5 py-1 rounded-lg">
                                        <Check size={12} className="text-forest" /> Rating Submitted
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setReviewingItem({
                                            productId: prodId,
                                            productName: item.name,
                                            productImage: item.image,
                                            orderId: o._id,
                                          });
                                          setReviewRating(5);
                                          setReviewTitle("");
                                          setReviewComment("");
                                        }}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-copper hover:bg-copper-dark px-2.5 py-1 rounded-lg shadow-sm transition-all active:scale-95"
                                      >
                                        <Star size={11} className="fill-gold text-gold" /> Rate & Review
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Order Journey Stepper */}
                      {o.orderStatus !== "CANCELLED" ? (
                        <div className="mt-5 rounded-xl bg-sand/20 border border-ink/5 p-4">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[11px] font-bold text-ink/70 uppercase tracking-wider flex items-center gap-1.5">
                              <Truck size={13} className="text-copper" /> Order Journey
                            </span>
                            {o.orderStatus === "DELIVERED" ? (
                              <span className="text-[11px] font-bold text-forest flex items-center gap-1 bg-forest/10 px-2 py-0.5 rounded-full">
                                <Check size={12} /> Delivered
                              </span>
                            ) : o.shipping?.awbCode ? (
                              <button
                                onClick={() => handleOpenTracking(o)}
                                className="text-[11px] font-bold text-copper hover:underline flex items-center gap-1"
                              >
                                <span>Track Live (AWB: {o.shipping.awbCode})</span>
                                <ExternalLink size={12} />
                              </button>
                            ) : (
                              <span className="text-[11px] text-ink/40">
                                Express Delivery across India
                              </span>
                            )}
                          </div>

                          {/* Stepper progress bar */}
                          <div className="relative mt-2">
                            <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-ink/10 -z-0">
                              <div
                                className="h-full bg-forest transition-all duration-500"
                                style={{
                                  width: `${(getActiveStepIndex(o.orderStatus) / (TRACKING_STEPS.length - 1)) * 100}%`,
                                }}
                              />
                            </div>

                            <div className="relative z-10 flex items-center justify-between">
                              {TRACKING_STEPS.map((step, sIdx) => {
                                const activeIdx = getActiveStepIndex(o.orderStatus);
                                const isDone = sIdx <= activeIdx;
                                const isCurrent = sIdx === activeIdx;
                                const StepIcon = step.icon;

                                return (
                                  <div key={step.key} className="flex flex-col items-center text-center">
                                    <div
                                      className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition-all shadow-sm ${isDone
                                          ? "bg-forest text-white"
                                          : isCurrent
                                            ? "bg-copper text-white ring-2 ring-copper/30"
                                            : "bg-white text-ink/30 border border-ink/10"
                                        }`}
                                    >
                                      {isDone ? <Check size={14} /> : <StepIcon size={13} />}
                                    </div>
                                    <span
                                      className={`mt-1.5 text-[10px] font-semibold tracking-tight ${isDone ? "text-ink font-bold" : "text-ink/40"
                                        }`}
                                    >
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                          <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                          <span>This order was cancelled. Please contact support if you need assistance.</span>
                        </div>
                      )}

                      {/* Summary footer */}
                      <div className="mt-4 flex flex-wrap items-center justify-between border-t border-ink/5 pt-3 text-xs gap-3">
                        <div className="text-ink/60">
                          {o.shippingAddress && (
                            <span>
                              Deliver to: <strong>{o.shippingAddress.city}, {o.shippingAddress.state}</strong>
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <div className="flex items-center gap-1.5 mr-1">
                            <span className="text-ink/50">Total:</span>
                            <span className="text-sm font-bold text-copper">{formatINR(o.pricing.total)}</span>
                          </div>

                          <button
                            onClick={() => setSelectedInvoiceOrder(o)}
                            className="btn-outline text-xs py-1.5 px-3 font-semibold flex items-center gap-1.5"
                          >
                            <FileText size={13} /> View Invoice
                          </button>

                          {o.shipping?.awbCode && o.orderStatus !== "DELIVERED" && (
                            <button
                              onClick={() => handleOpenTracking(o)}
                              className="btn-outline text-xs py-1.5 px-3 font-semibold flex items-center gap-1"
                            >
                              <Truck size={13} /> Track
                            </button>
                          )}

                          {o.orderStatus === "PENDING_PAYMENT" && (
                            <>
                              <button
                                onClick={() => setCancellingOrder(o)}
                                className="btn-outline text-xs py-1.5 px-3 font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                              >
                                Cancel Order
                              </button>
                              <button
                                onClick={() => handlePayPendingOrder(o)}
                                className="btn-primary text-xs py-1.5 px-3 font-bold"
                              >
                                {o.payment?.method === "PARTIAL_COD"
                                  ? `Pay Advance · ${formatINR(o.pricing?.advanceAmount || 149)}`
                                  : "Pay with Razorpay"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sand mb-3">
                    <Package size={22} className="text-ink/40" />
                  </div>
                  <p className="font-bold text-ink">No orders yet</p>
                  <p className="mt-1 text-xs text-ink/60">Explore our premium collection and place your first order.</p>
                  <Link to="/shop" className="btn-copper mt-5 inline-flex text-xs">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Addresses */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                    <MapPin size={20} className="text-copper" /> Saved Addresses
                  </h2>
                  <p className="text-xs text-ink/50 mt-0.5">Manage your delivery and billing addresses.</p>
                </div>
                <button onClick={handleOpenAddAddress} className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold">
                  <Plus size={14} /> Add Address
                </button>
              </div>

              {loadingAddresses ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <AddressCardSkeleton />
                  <AddressCardSkeleton />
                </div>
              ) : addresses.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`card p-5 flex flex-col justify-between transition-all ${addr.isDefault ? "border-copper/40 shadow-sm ring-1 ring-copper/30" : "border-ink/10"
                        }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-ink">{addr.fullName}</span>
                            {addr.addressType && (
                              <span className="bg-sand text-ink/60 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                {addr.addressType}
                              </span>
                            )}
                          </div>
                          {addr.isDefault && (
                            <span className="bg-forest/10 text-forest text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs font-semibold text-ink/60">+91 {addr.phone}</p>
                        <p className="mt-2.5 text-xs text-ink/70 leading-relaxed">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                          {addr.landmark ? `, Near ${addr.landmark}` : ""}
                          <br />
                          {addr.city}, {addr.state} - <strong className="text-ink">{addr.postalCode}</strong>
                          <br />
                          {addr.country || "India"}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-ink/5 pt-3 text-xs">
                        <div>
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr._id)}
                              className="text-copper hover:underline font-semibold text-[11px]"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenEditAddress(addr)}
                            className="text-ink/50 hover:text-copper flex items-center gap-1 font-medium"
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => setAddressToDelete(addr)}
                            className="text-ink/40 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sand mb-3">
                    <MapPin size={22} className="text-ink/40" />
                  </div>
                  <p className="font-bold text-ink">No saved addresses</p>
                  <p className="mt-1 text-xs text-ink/60">Add a delivery address to speed up checkout.</p>
                  <button onClick={handleOpenAddAddress} className="btn-copper mt-5 inline-flex text-xs">
                    <Plus size={14} /> Add New Address
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Address Create / Edit Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShowAddressModal(false)} />
          <div className="relative w-full max-w-lg card p-6 shadow-lift bg-cream animate-fade-up">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <h3 className="font-sans text-base font-bold text-ink flex items-center gap-2 tracking-normal">
                <MapPin size={18} className="text-copper" />
                {editingAddressId ? "Edit Address" : "Add New Address"}
              </h3>
              <button onClick={() => setShowAddressModal(false)} className="p-1 text-ink/40 hover:text-ink rounded-full">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
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
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, "") })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1">
                  Street Address / House No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="House / Flat No., Building, Street"
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Apartment / Suite (Optional)</label>
                  <input
                    type="text"
                    placeholder="Floor 2, Flat 204"
                    value={addressForm.addressLine2 || ""}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="Near City Park"
                    value={addressForm.landmark || ""}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
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
                    required
                    maxLength={6}
                    placeholder="143001"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value.replace(/\D/g, "") })}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
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
                  <span>Default address</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-ink/10 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="btn-primary text-xs py-2 px-6 flex items-center gap-2 font-bold"
                >
                  {savingAddress && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingAddressId ? "Save Changes" : "Add Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Address Confirmation Modal */}
      {addressToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
          onClick={() => !deletingAddress && setAddressToDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lift border border-ink/10 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-sans text-sm font-bold text-ink tracking-normal">Delete this address?</h3>
                <p className="mt-1 text-xs text-ink/60 leading-relaxed font-sans">
                  This will remove the delivery address for <strong className="text-ink font-semibold">{addressToDelete.fullName}</strong> ({addressToDelete.city}, {addressToDelete.state}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                className="text-ink/40 hover:text-ink p-1 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-ink/5 pt-3">
              <button
                type="button"
                disabled={deletingAddress}
                onClick={() => setAddressToDelete(null)}
                className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-ink/70 hover:bg-sand/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingAddress}
                onClick={async () => {
                  try {
                    setDeletingAddress(true);
                    await addressApi.deleteAddress(addressToDelete._id);
                    toast.success("Address deleted.");
                    setAddressToDelete(null);
                    await loadAddresses();
                  } catch (err: any) {
                    toast.error(err.message || "Failed to delete address.");
                  } finally {
                    setDeletingAddress(false);
                  }
                }}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {deletingAddress && <Loader2 className="w-3 h-3 animate-spin" />}
                {deletingAddress ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shiprocket Live Tracking Modal */}
      {trackingOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setTrackingOrder(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift border border-ink/10 animate-fade-up max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-ink/5 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-copper">
                  Shiprocket Live Tracking
                </span>
                <h3 className="font-sans text-base font-bold text-ink">
                  Order #{trackingOrder.orderNumber}
                </h3>
                {trackingOrder.shipping?.awbCode && (
                  <p className="text-xs text-ink/55 mt-0.5">
                    AWB: <strong>{trackingOrder.shipping.awbCode}</strong> · Courier:{" "}
                    <strong>{trackingOrder.shipping.courierName || "Shiprocket Express"}</strong>
                  </p>
                )}
              </div>
              <button
                onClick={() => setTrackingOrder(null)}
                className="text-ink/40 hover:text-ink p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {loadingTracking ? (
                <div className="flex flex-col items-center justify-center py-10 text-ink/40 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-copper" />
                  <p className="text-xs">Fetching live updates from Shiprocket...</p>
                </div>
              ) : trackingData?.tracking_data?.shipment_track_activities &&
                trackingData.tracking_data.shipment_track_activities.length > 0 ? (
                <div className="relative pl-6 space-y-5 border-l-2 border-copper/30 my-2">
                  {trackingData.tracking_data.shipment_track_activities.map((act: any, aIdx: number) => (
                    <div key={aIdx} className="relative">
                      <div className="absolute -left-[31px] top-0 grid h-4 w-4 place-items-center rounded-full bg-copper text-white text-[9px]">
                        ✓
                      </div>
                      <p className="text-xs font-bold text-ink">{act.activity || act.status}</p>
                      <p className="text-[11px] text-ink/60">{act.location}</p>
                      <p className="text-[10px] text-ink/40 mt-0.5">{act.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-sand/30 p-4 text-xs space-y-2 text-ink/70">
                  <div className="flex items-center gap-2 font-bold text-ink">
                    <Truck size={16} className="text-copper" />
                    <span>Shipment In Transit</span>
                  </div>
                  <p className="text-ink/60 leading-relaxed">
                    Your package is being securely dispatched with Shiprocket express logistics. Real-time scanning checkpoints will update as the courier handles your order.
                  </p>
                  {trackingData?.tracking_data?.track_url && (
                    <a
                      href={trackingData.tracking_data.track_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-copper hover:underline mt-2"
                    >
                      Open Official Shiprocket Tracker <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setTrackingOrder(null)}
                className="btn-primary text-xs py-2 px-5 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details & Printable Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white"
          onClick={() => setSelectedInvoiceOrder(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-lift border border-ink/10 animate-fade-up max-h-[90vh] overflow-y-auto print:shadow-none print:border-none print:max-h-none print:w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b border-ink/10 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl font-bold tracking-tight text-ink">AUREX INDIA</span>
                  <span className="bg-copper/10 text-copper text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Tax Invoice / Receipt
                  </span>
                </div>
                <p className="text-[11px] text-ink/50 mt-1">
                  Official Purchase Receipt & Proof of Delivery
                </p>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="btn-outline text-xs py-1.5 px-3 font-semibold flex items-center gap-1.5"
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="text-ink/40 hover:text-ink p-1.5 rounded-lg hover:bg-sand/40 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-ink/5 text-xs">
              <div>
                <span className="text-ink/40 block text-[10px] uppercase font-bold">Order Number</span>
                <strong className="text-ink font-mono font-bold">{selectedInvoiceOrder.orderNumber}</strong>
              </div>
              <div>
                <span className="text-ink/40 block text-[10px] uppercase font-bold">Order Date</span>
                <strong className="text-ink font-semibold">
                  {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </div>
              <div>
                <span className="text-ink/40 block text-[10px] uppercase font-bold">Payment Mode</span>
                <strong className="text-ink font-semibold">
                  {selectedInvoiceOrder.payment?.method === "PARTIAL_COD"
                    ? "Partial Payment + COD"
                    : selectedInvoiceOrder.payment?.method === "COD"
                    ? "Cash on Delivery"
                    : "Prepaid (Razorpay)"}
                </strong>
              </div>
              <div>
                <span className="text-ink/40 block text-[10px] uppercase font-bold">Payment Status</span>
                <span
                  className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] mt-0.5 ${
                    selectedInvoiceOrder.payment?.status === "SUCCESS"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedInvoiceOrder.payment?.method === "PARTIAL_COD"
                      ? (selectedInvoiceOrder.payment?.paidAmount || 0) > 0
                        ? selectedInvoiceOrder.payment?.isCodSettled
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                        : "bg-amber-100 text-amber-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedInvoiceOrder.payment?.method === "PARTIAL_COD"
                    ? (selectedInvoiceOrder.payment?.paidAmount || 0) > 0
                      ? selectedInvoiceOrder.payment?.isCodSettled
                        ? "COD SETTLED"
                        : "PARTIALLY PAID"
                      : "ADVANCE PENDING"
                    : selectedInvoiceOrder.payment?.status || "PENDING"}
                </span>
              </div>
            </div>

            {/* Delivery Address & Logistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-ink/5 text-xs">
              <div className="space-y-1">
                <span className="text-ink/40 block text-[10px] uppercase font-bold">Shipping Address</span>
                <p className="font-bold text-ink">{selectedInvoiceOrder.shippingAddress?.fullName}</p>
                <p className="text-ink/70">
                  {selectedInvoiceOrder.shippingAddress?.addressLine1}
                  {selectedInvoiceOrder.shippingAddress?.addressLine2
                    ? `, ${selectedInvoiceOrder.shippingAddress.addressLine2}`
                    : ""}
                  {selectedInvoiceOrder.shippingAddress?.landmark
                    ? `, Near ${selectedInvoiceOrder.shippingAddress.landmark}`
                    : ""}
                </p>
                <p className="text-ink/70">
                  {selectedInvoiceOrder.shippingAddress?.city}, {selectedInvoiceOrder.shippingAddress?.state} -{" "}
                  {selectedInvoiceOrder.shippingAddress?.postalCode}
                </p>
                <p className="text-ink/60 font-semibold">+91 {selectedInvoiceOrder.shippingAddress?.phone}</p>
              </div>

              <div className="space-y-2">
                {selectedInvoiceOrder.shipping?.awbCode && (
                  <div className="bg-sand/30 rounded-xl p-3 text-xs space-y-1">
                    <span className="text-ink/50 text-[10px] uppercase font-bold block">Logistics Partner</span>
                    <p className="font-bold text-ink">
                      {selectedInvoiceOrder.shipping.courierName || "Shiprocket Express"}
                    </p>
                    <p className="text-[11px] text-ink/60 font-mono">
                      AWB: {selectedInvoiceOrder.shipping.awbCode}
                    </p>
                  </div>
                )}

                {selectedInvoiceOrder.coupon && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Tag size={13} className="text-emerald-600" />
                      <span>Coupon Applied</span>
                    </div>
                    {selectedInvoiceOrder.pricing?.discount > 0 && (
                      <span className="font-bold text-emerald-700">
                        -₹{selectedInvoiceOrder.pricing.discount.toLocaleString()} Saved
                      </span>
                    )}
                  </div>
                )}

                {selectedInvoiceOrder.notes && (
                  <div className="text-xs text-ink/60 italic bg-sand/20 rounded-xl p-2.5">
                    <strong>Delivery Notes:</strong> {selectedInvoiceOrder.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Items Breakdown Table */}
            <div className="py-4 border-b border-ink/5">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-ink/10 text-ink/40 uppercase text-[10px] font-bold">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {selectedInvoiceOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-9 w-9 rounded-lg object-cover border border-ink/5"
                            />
                          )}
                          <div>
                            <p className="font-bold text-ink">{item.name}</p>
                            {item.sku && <p className="text-[10px] text-ink/40 font-mono">SKU: {item.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-center font-semibold text-ink/80">{item.quantity}</td>
                      <td className="py-2.5 text-right font-medium text-ink/70">{formatINR(item.unitPrice)}</td>
                      <td className="py-2.5 text-right font-bold text-ink">
                        {formatINR(item.total || item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Breakdown Totals */}
            <div className="flex justify-end pt-4">
              <div className="w-full sm:w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-ink/60">
                  <span>Subtotal</span>
                  <span>{formatINR(selectedInvoiceOrder.pricing?.subtotal || 0)}</span>
                </div>
                {selectedInvoiceOrder.pricing?.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-{formatINR(selectedInvoiceOrder.pricing.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-ink/60">
                  <span>Shipping</span>
                  <span className="text-forest font-semibold">
                    {selectedInvoiceOrder.pricing?.shippingFee === 0
                      ? "FREE"
                      : formatINR(selectedInvoiceOrder.pricing?.shippingFee || 0)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-ink/10 pt-2 text-sm font-bold text-ink">
                  <span>Grand Total</span>
                  <span className="text-copper">{formatINR(selectedInvoiceOrder.pricing?.total || 0)}</span>
                </div>
                {selectedInvoiceOrder.payment?.method === "PARTIAL_COD" && (
                  <div className="mt-2.5 pt-2 border-t border-dashed border-ink/15 space-y-1 text-xs">
                    <div className={`flex justify-between ${(selectedInvoiceOrder.payment?.paidAmount || 0) > 0 ? "text-forest" : "text-amber-800"} font-semibold`}>
                      <span>{(selectedInvoiceOrder.payment?.paidAmount || 0) > 0 ? "Advance Paid Online:" : "Advance Payable Online (Due):"}</span>
                      <span>{formatINR((selectedInvoiceOrder.payment?.paidAmount || 0) > 0 ? (selectedInvoiceOrder.payment?.paidAmount || 0) : (selectedInvoiceOrder.pricing?.advanceAmount || 0))}</span>
                    </div>
                    <div className="flex justify-between text-amber-800 font-bold">
                      <span>{selectedInvoiceOrder.payment?.isCodSettled ? "COD Amount (Collected):" : "COD Balance Due on Delivery:"}</span>
                      <span>{formatINR(selectedInvoiceOrder.payment?.remainingCodAmount || selectedInvoiceOrder.pricing?.codAmount || 0)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-6 border-t border-ink/5 pt-4 text-[10px] text-ink/40 text-center flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>Aurex India Private Limited · Luxury Certified Cookware</span>
              <div className="flex items-center gap-2 print:hidden">
                {selectedInvoiceOrder.orderStatus === "PENDING_PAYMENT" && (
                  <button
                    onClick={() => {
                      const ord = selectedInvoiceOrder;
                      setSelectedInvoiceOrder(null);
                      setCancellingOrder(ord);
                    }}
                    className="btn-outline text-xs py-1.5 px-3 font-semibold text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="btn-outline text-xs py-1.5 px-4"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Review & Rating Modal */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-ink/10 relative animate-scale-up">
            <button
              onClick={() => setReviewingItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-sand/60 text-ink/60 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-ink/10">
              {reviewingItem.productImage && (
                <img
                  src={reviewingItem.productImage}
                  alt={reviewingItem.productName}
                  className="w-12 h-12 rounded-xl object-cover border border-ink/5 bg-sand/30"
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-copper">
                  Verified Purchase Review
                </span>
                <h3 className="text-sm font-bold text-ink truncate">{reviewingItem.productName}</h3>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 pt-4">
              {/* Interactive Stars Selector */}
              <div>
                <label className="block text-xs font-bold text-ink mb-2">Overall Rating</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (reviewHover || reviewRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setReviewHover(star)}
                          onMouseLeave={() => setReviewHover(0)}
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star
                            size={26}
                            className={`${
                              isFilled
                                ? "fill-gold text-gold"
                                : "text-gray-200 fill-gray-100"
                            } transition-colors`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-ink/70 ml-2">
                    {reviewRating === 5 && "⭐ Excellent"}
                    {reviewRating === 4 && "⭐ Very Good"}
                    {reviewRating === 3 && "⭐ Good"}
                    {reviewRating === 2 && "⭐ Fair"}
                    {reviewRating === 1 && "⭐ Needs Improvement"}
                  </span>
                </div>
              </div>

              {/* Review Headline */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Headline / Title</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Best kadhai I've used, heats evenly!"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-ink/15 focus:border-copper focus:ring-2 focus:ring-copper/10 outline-none"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Your Detailed Experience</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Tell other home cooks about the quality, heat retention, weight, and cleaning ease..."
                  className="w-full text-xs p-3.5 rounded-xl border border-ink/15 focus:border-copper focus:ring-2 focus:ring-copper/10 outline-none resize-none"
                />
              </div>

              {/* Photos upload */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Add Photos <span className="text-ink/40 font-normal">(Optional, up to 4)</span>
                </label>
                <input
                  type="file"
                  ref={accountFileInputRef}
                  onChange={handleAccountFileChange}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2.5">
                  {accountReviewImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group w-16 h-16 rounded-xl overflow-hidden border border-ink/15 bg-sand/30 shadow-2xs"
                    >
                      <img
                        src={img.url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAccountPhoto(idx)}
                        className="absolute top-1 right-1 bg-ink/80 hover:bg-red-600 text-white p-0.5 rounded-full shadow-sm transition-colors"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {isUploadingAccountPhoto && (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-copper/50 bg-copper/5 flex flex-col items-center justify-center text-copper">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-[9px] font-bold mt-1">Uploading...</span>
                    </div>
                  )}

                  {accountReviewImages.length < 4 && !isUploadingAccountPhoto && (
                    <button
                      type="button"
                      onClick={() => accountFileInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-ink/20 hover:border-copper hover:bg-copper/5 text-ink/60 hover:text-copper flex flex-col items-center justify-center transition-all active:scale-95 group"
                    >
                      <Camera size={18} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-bold mt-0.5">+ Photo</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-ink/40 mt-1.5">
                  Share photos of your cookware to help other home cooks!
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-ink/70 hover:bg-sand/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="btn-copper text-xs py-2 px-5 font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingReview && <Loader2 size={13} className="animate-spin" />}
                  <span>Submit Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancellingOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in"
          onClick={() => !isCancelling && setCancellingOrder(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center animate-scale-up border border-ink/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-3.5">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-ink">Cancel This Order?</h3>
            <p className="text-xs text-ink/60 mt-1.5 leading-relaxed">
              Are you sure you want to cancel order{" "}
              <strong className="text-ink font-semibold">{cancellingOrder.orderNumber}</strong>? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancellingOrder(null)}
                className="btn-outline text-xs py-2 px-4 font-semibold disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="btn text-xs py-2 px-4 font-bold bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isCancelling && <Loader2 size={13} className="animate-spin" />}
                <span>{isCancelling ? "Cancelling..." : "Yes, Cancel Order"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Payment Processing Overlay */}
      <PaymentProcessingOverlay
        isOpen={Boolean(payingOrder)}
        stage={payingStage}
        amount={payingOrder?.pricing?.total}
      />
    </div>
  );
}
