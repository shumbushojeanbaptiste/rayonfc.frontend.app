import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface Plan {
  plan_id: number;
  name: string;
  price: string;
  duration_days: number;
  description: string;
}

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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingMethods, setLoadingMethods] = useState(true);

  const navigate = useNavigate();
  const amount = Number(plan.price);

  // ------------------------------------------------
  // LOAD PAYMENT METHODS
  // ------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const loadPaymentMethods = async () => {
      try {
        const res = await api.get("/api/settings/paymentMethods");
        const raw: RawPaymentMethod[] = res.data?.data || [];

        const methods: PaymentMethod[] = raw
          .map((m) => ({
            id: m.id ?? m.payment_method_id ?? m.method_id ?? -1,
            name: m.name,
          }))
          .filter((m) => m.id > 0);

        if (!cancelled) {
          setPaymentMethods(methods);
          if (methods.length > 0) setSelectedMethod(methods[0].id);
        }
      } catch (err) {
        console.warn("Failed to load payment methods:", err);
        if (!cancelled) setPaymentMethods([]);
      } finally {
        if (!cancelled) setLoadingMethods(false);
      }
    };

    loadPaymentMethods();

    return () => {
      cancelled = true;
    };
  }, []);

  // ------------------------------------------------
  // SUBSCRIBE
  // ------------------------------------------------
  const handleSubscribe = async () => {
    if (loading) return;

    setErrorMessage(null);

    if (!selectedMethod) {
      setErrorMessage("Please select a payment method.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/payments/subscription", {
        payment_method: selectedMethod,
        amount: amount,
        plan_id: plan.plan_id,
      });

      if (res.data?.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.data?.message || "Subscription failed.");
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

  const handleTopUp = () => {
    navigate("/finance/deposits?deposit=true");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-semibold text-slate-700 mb-3 capitalize">
          Subscribe to {plan.name}
        </h2>

        <p className="mb-4 text-sm text-slate-600">
          Price: <strong>{amount.toLocaleString()} RWF</strong>
        </p>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-300 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-slate-600">
            Payment Method
          </h3>

          {loadingMethods ? (
            <p className="text-sm text-gray-500">
              Loading payment methods...
            </p>
          ) : paymentMethods.length === 0 ? (
            <p className="text-sm text-red-500">
              No payment methods available.
            </p>
          ) : (
            paymentMethods.map((method) => (
              <label
                key={method.id}
                className="flex gap-2 items-center cursor-pointer"
              >
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

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border font-semibold text-slate-600 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSubscribe}
            disabled={loading || loadingMethods}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm"}
          </button>

          <button
            onClick={handleTopUp}
            className="px-4 py-2 rounded-lg bg-red-500 font-semibold text-sm text-white"
          >
            Top Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscribePlanModal;
