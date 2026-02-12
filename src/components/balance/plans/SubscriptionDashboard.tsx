import React, { useEffect, useState } from "react";
import api from "../../../api";

interface Subscription {
  subs_id: number;
  plan: number;
  amount: string;
  start_date: string;
  end_date: string;
  status: number;
  created_at: string;
}

interface SubscriptionStatus {
  subscription_status: string;
  plan: number;
  remaining_days: number;
  end_date: string;
  last_subscription: Subscription;
  auto_renew?: boolean;
}

const SubscriptionDashboard: React.FC = () => {
  const [subscription, setSubscription] =
    useState<SubscriptionStatus | null>(null);
  const [history, setHistory] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRenew, setAutoRenew] = useState(false);

  const fetchSubscription = async () => {
    try {
      const res = await api.get(
        "/api/accessible/subscription-status"
      );

      if (res.data.success) {
        const data = res.data.data;
        setSubscription(data);
        setAutoRenew(data.auto_renew || false);
      }
    } catch (err) {
      console.error("Failed to load subscription");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(
        "/api/payments/subscription-history"
      );

      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load history");
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchSubscription();
      await fetchHistory();
      setLoading(false);
    };

    load();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString();

  // ---------------------------------------
  // CANCEL SUBSCRIPTION
  // ---------------------------------------
  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel?"))
      return;

    try {
      const res = await api.post(
        "/api/payments/cancel-subscription"
      );

      if (res.data.success) {
        await fetchSubscription();
      }
    } catch (err) {
      console.error("Cancel failed");
    }
  };

  // ---------------------------------------
  // TOGGLE AUTO RENEW
  // ---------------------------------------
  const toggleAutoRenew = async () => {
    try {
      const res = await api.patch(
        "/api/payments/auto-renew",
        {
          auto_renew: !autoRenew,
        }
      );

      if (res.data.success) {
        setAutoRenew(!autoRenew);
      }
    } catch (err) {
      console.error("Failed to toggle auto renew");
    }
  };

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        My Subscription
      </h1>

      {subscription?.subscription_status === "active" ? (
        <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow mb-10">
          <h2 className="text-xl font-semibold mb-4">
            Active Plan
          </h2>

          <p>
            <strong>Plan ID:</strong> {subscription.plan}
          </p>

          <p>
            <strong>Start:</strong>{" "}
            {formatDate(
              subscription.last_subscription.start_date
            )}
          </p>

          <p>
            <strong>End:</strong>{" "}
            {formatDate(subscription.end_date)}
          </p>

          <p>
            <strong>Remaining:</strong>{" "}
            {subscription.remaining_days} day(s)
          </p>

          {/* AUTO RENEW */}
          <div className="mt-6 flex items-center gap-3">
            <input
              type="checkbox"
              checked={autoRenew}
              onChange={toggleAutoRenew}
            />
            <span>Enable Auto Renew</span>
          </div>

          {/* CANCEL BUTTON */}
          <button
            onClick={handleCancel}
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Cancel Subscription
          </button>
        </div>
      ) : (
        <div className="bg-yellow-100 p-6 rounded-lg mb-10">
          No active subscription
        </div>
      )}

      {/* HISTORY */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Subscription History
        </h2>

        <div className="bg-white dark:bg-boxdark rounded-xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 dark:bg-boxdark-2">
              <tr>
                <th className="p-3">Plan</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Start</th>
                <th className="p-3">End</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.subs_id} className="border-t">
                  <td className="p-3">{item.plan}</td>
                  <td className="p-3">
                    {Number(item.amount).toLocaleString()} RWF
                  </td>
                  <td className="p-3">
                    {formatDate(item.start_date)}
                  </td>
                  <td className="p-3">
                    {formatDate(item.end_date)}
                  </td>
                  <td className="p-3">
                    {item.status === 1
                      ? "Active"
                      : "Expired"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;
