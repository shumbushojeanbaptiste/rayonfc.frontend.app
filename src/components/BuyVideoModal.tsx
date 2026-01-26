import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Video } from "../types/videouser";
import { getAuthUser } from "../utils/auth";
import { encodeId } from "../utils/hashid";

interface PaymentMethod {
  id: number;
  name: string;
}

interface RawPaymentMethod {
  id?: number;
  payment_method_id?: number;
  method_id?: number;
  name: string;
}

interface Props {
  video: Video;
  walletBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

const BuyVideoModal: React.FC<Props> = ({ video, walletBalance, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingMethods, setLoadingMethods] = useState(true);

  const user = getAuthUser();
  const navigate = useNavigate();

  const canBuy = walletBalance >= Number(video.price || 0);

  // -----------------------------
  // Check if user already owns video
  // -----------------------------
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/api/videos/${video.id}/has-access`);
        const hasAccess = res?.data?.data?.hasAccess ?? false;
        if (hasAccess) {
          navigate(`/watch/${encodeId(video.id)}`);
          onClose();
        }
      } catch (err) {
        console.warn("Failed to check video access:", err);
      }
    };
    checkAccess();
  }, [video.id, user, navigate, onClose]);

  // -----------------------------
  // Load payment methods if user can buy
  // -----------------------------
  useEffect(() => {
    if (!canBuy) return;

    const loadPaymentMethods = async () => {
      setLoadingMethods(true);
      try {
        const res = await api.get("/api/settings/paymentMethods");
        const raw: RawPaymentMethod[] = res.data?.data || [];

        const methods: PaymentMethod[] = raw
          .map((m: RawPaymentMethod) => ({
            id: m.id ?? m.payment_method_id ?? m.method_id ?? -1,
            name: m.name,
          }))
          .filter((m): m is PaymentMethod => m.id > 0);

        setPaymentMethods(methods);
        if (methods.length > 0) setSelectedMethod(methods[0].id);
      } catch (err) {
        console.warn("Failed to load payment methods:", err);
        setPaymentMethods([]);
      } finally {
        setLoadingMethods(false);
      }
    };

    loadPaymentMethods();
  }, [canBuy]);

  // -----------------------------
  // Buy video
  // -----------------------------
  const handleBuy = async () => {
    setErrorMessage(null);

    if (!user) {
      setErrorMessage("Please sign in to continue.");
      return;
    }

    if (!selectedMethod) {
      setErrorMessage("No payment method available.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(
        "/api/payments/buy-video",
        {
          user_id: user.user_id,
          payment_method: selectedMethod,
          amount: video.price,
          video_id: video.id,
        },
        { headers: { Authorization: `Bearer ${user.jwt}` } }
      );

      if (res.data?.status === "successful") {
        onSuccess();
        navigate(`/watch/${encodeId(video.id)}`);
      } else {
        setErrorMessage(res.data?.message || "Payment failed.");
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || String(err) || "Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Top up
  // -----------------------------
  const handleTopUp = () => {
    navigate("/finance/deposits?deposit=true");
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-3">{video.title}</h2>

        <p className="mb-2 text-sm">
          Price: <strong>{video.price} RWF</strong>
        </p>

        {!canBuy && (
          <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-300 p-3 text-sm text-yellow-800">
            Your wallet balance is too low to buy this video.
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-300 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {canBuy && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Payment Method</h3>

            {loadingMethods ? (
              <p className="text-sm text-gray-500">Loading payment methods...</p>
            ) : paymentMethods.length === 0 ? (
              <p className="text-sm text-red-500">No payment methods available.</p>
            ) : (
              paymentMethods.map((method) => (
                <label key={method.id} className="flex gap-2 items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedMethod === method.id}
                    onChange={() => setSelectedMethod(method.id)}
                  />
                  {method.name}
                </label>
              ))
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border font-semibold">
            Cancel
          </button>

          {canBuy ? (
            <button
              onClick={handleBuy}
              disabled={loading || paymentMethods.length === 0}
              className="px-4 py-2 rounded-lg bg-[#05333a] text-white font-semibold"
            >
              {loading ? "Processing..." : "Buy & Watch"}
            </button>
          ) : (
            <button
              onClick={handleTopUp}
              className="px-4 py-2 rounded-lg bg-[#e0e327] font-semibold"
            >
              Top Up Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyVideoModal;
