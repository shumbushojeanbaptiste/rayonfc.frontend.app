import React, { useEffect, useState } from "react";
import api from "../api";
import { Video } from "../types/videouser";
import { getAuthUser } from "../utils/auth";

interface PaymentMethod {
  id: number;
  name: string;
}

interface Props {
  video: Video;
  onClose: () => void;
  onSuccess: () => void;
}

const BuyVideoModal: React.FC<Props> = ({ video, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const user = getAuthUser(); // ✅ signed-in user

  // 🔹 Load & normalize payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const res = await api.get("/api/settings/paymentMethods");

        const raw = res.data?.data || res.data || [];

        const methods: PaymentMethod[] = raw
          .map((m: any) => ({
            id: m.id ?? m.payment_method_id ?? m.method_id,
            name: m.name,
          }))
          .filter((m: PaymentMethod) => typeof m.id === "number");

        setPaymentMethods(methods);

        // ✅ AUTO-SELECT FIRST AVAILABLE METHOD
        if (methods.length > 0) {
          setSelectedMethod(methods[0].id);
        }
      } catch (err) {
        console.error("Failed to load payment methods:", err);
        setPaymentMethods([]);
      }
    };

    loadPaymentMethods();
  }, []);

  const handleBuy = async () => {
    setErrorMessage(null);

    if (!user) {
      setErrorMessage("Please sign in to continue with your purchase.");
      return;
    }

    if (!selectedMethod) {
      setErrorMessage("No payment method is currently available.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        user_id: user.user_id,          // ✅ FROM SIGNED USER
        payment_method: selectedMethod, // ✅ FROM API
        amount: video.price,            // ✅ VIDEO PRICE (WALLET)
        video_id: video.id,             // ✅ VIDEO
      };

      const res = await api.post("/api/payments/buy-video", body, {
        headers: {
          Authorization: `Bearer ${user.jwt}`,
        },
      });

      if (res.data?.status === "successful") {
        onSuccess();
      } else {
        setErrorMessage(
          res.data?.message === "You already purchased this video"
            ? "You have already purchased this video."
            : res.data?.message || "Payment failed. Please try again."
        );
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMessage(
        err.response?.data?.message === "You already purchased this video"
          ? "You have already purchased this video."
          : err.response?.data?.message || "Payment failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Buy Video</h2>

        <p className="mb-2">
          {video.title} — <strong>{video.price} RWF</strong>
        </p>

        <p className="mb-4 text-sm text-gray-600">
          Amount will be deducted from your wallet balance.
        </p>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-300 p-3 text-sm text-yellow-800">
            {errorMessage}
          </div>
        )}

        {/* PAYMENT METHODS */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Payment Method</h3>

          <div className="flex flex-col gap-2">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                />
                <span>{method.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-400 font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleBuy}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Processing..." : "Buy Now"}
          </button>
        </div>
      </div>
    </div> 
  );
};

export default BuyVideoModal;
