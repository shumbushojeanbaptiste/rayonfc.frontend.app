import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface Plan {
  plan_id: number;
  name: string;
  price: string;
  duration_days: number;
  description: string;
}

interface Props {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
}

const SubscribePlanModal: React.FC<Props> = ({
  plan,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const amount = Number(plan.price);

  // ------------------------------------------------
  // SUBSCRIBE
  // ------------------------------------------------
  const handleSubscribe = async () => {
    if (loading) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await api.post("/api/payments/subscription", {
        plan_id: plan.plan_id,
        amount: amount,
      });

      if (res.data?.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(
          res.data?.message || "Subscription failed."
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          "Payment failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // TOP UP
  // ------------------------------------------------
  const handleTopUp = () => {
    navigate("/finance/deposits?deposit=true");
  };

  // ------------------------------------------------
  // UI
  // ------------------------------------------------
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">

        {/* TITLE */}
        <h2 className="text-xl font-semibold text-slate-700 mb-3 capitalize">
          Subscribe to {plan.name}
        </h2>

        {/* PRICE */}
        <p className="mb-4 text-sm text-slate-600">
          Price:{" "}
          <strong>
            {amount.toLocaleString()} RWF
          </strong>
        </p>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-300 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* INFORMATION */}
        <div className="mb-5 rounded-lg bg-slate-50 p-3">
          <p className="text-sm text-slate-600">
            Your account balance will be used to activate this
            subscription.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3">

          {/* CANCEL */}
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border font-semibold text-slate-600 text-sm disabled:opacity-50"
          >
            Cancel
          </button>

          {/* CONFIRM */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm"}
          </button>

          {/* TOP UP */}
          <button
            onClick={handleTopUp}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-500 font-semibold text-sm text-white disabled:opacity-50"
          >
            Top Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscribePlanModal;