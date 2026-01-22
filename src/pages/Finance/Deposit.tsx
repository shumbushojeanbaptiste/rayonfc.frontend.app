import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLocation } from "react-router-dom"; // ✅ NEW
import api from "../../api";

// -----------------------------
// Types
// -----------------------------
type PaymentMethodRaw = {
  method_id?: number;
  payment_method_id?: number;
  id?: number;
  name: string;
};

type PaymentMethod = {
  id: number;
  name: string;
};

type Currency = {
  currency_id: number;
  currency_name: string;
};

export default function Deposit() {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Deposit modal
  const [showDeposit, setShowDeposit] = useState(false);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);

  // Withdraw modal
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // DB data
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // Signed user
  const userSession = localStorage.getItem("user"); // ✅ UPDATED to localStorage
  const user = userSession ? JSON.parse(userSession) : null;
  const userId = user?.user_id;
  const location = useLocation(); // ✅ NEW

  // --------------------------------
  // AUTO OPEN DEPOSIT MODAL
  // --------------------------------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("deposit") === "true") {
      setShowDeposit(true);
    }
  }, [location.search]);

  // -----------------------------
  // Independent balance loader
  // -----------------------------
  const loadBalance = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/api/payments/balance/${userId}`);
      setWallet(res.data.data);
    } catch (err) {
      console.error("Balance load failed:", err);
    }
  };

  // -----------------------------
  // Load dashboard (NO balance here)
  // -----------------------------
  useEffect(() => {
    if (!userId) return;

    async function loadDashboard() {
      try {
        const [dashboardRes, analyticsRes] = await Promise.all([
          api.get("/api/studio/dashboard"),
          api.get("/api/studio/analytics"),
        ]);

        setStats(dashboardRes.data.data);
        setAnalytics(analyticsRes.data.data || []);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
    loadBalance();
  }, [userId]);

  // -----------------------------
  // Load payment methods
  // -----------------------------
  useEffect(() => {
    api.get("/api/settings/paymentMethods").then((res) => {
      const raw: PaymentMethodRaw[] = res.data?.data || [];

      const normalized: PaymentMethod[] = raw
        .map((pm) => {
          const id = pm.method_id ?? pm.payment_method_id ?? pm.id;
          if (typeof id !== "number") return null;
          return { id, name: pm.name };
        })
        .filter((pm): pm is PaymentMethod => pm !== null);

      setPaymentMethods(normalized);
    });
  }, []);

  // -----------------------------
  // Load currencies
  // -----------------------------
  useEffect(() => {
    api
      .get("/api/currencies/all")
      .then((res) => setCurrencies(res.data.data || []))
      .catch((err) => console.error(err));
  }, []);

  // -----------------------------
  // Deposit
  // -----------------------------
  const handleDeposit = async () => {
    if (!amount || !phone || !paymentMethodId || !currencyId) {
      alert("Please fill all deposit fields.");
      return;
    }

    const payload = {
      user_id: Number(userId),
      payment_methods: Number(paymentMethodId),
      amount: Number(amount),
      phone: phone.trim(),
      currency: Number(currencyId),
    };

    try {
      setDepositLoading(true);
      await api.post("/api/payments/init-deposit", payload);
      await loadBalance();

      setAmount("");
      setPhone("");
      setPaymentMethodId("");
      setCurrencyId("");
      setShowDeposit(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Deposit failed");
    } finally {
      setDepositLoading(false);
    }
  };

  // -----------------------------
  // Withdraw
  // -----------------------------
  const handleWithdraw = async () => {
    if (!withdrawAmount || !paymentMethodId || !currencyId) {
      alert("Please fill all withdraw fields.");
      return;
    }

    if (Number(withdrawAmount) > balance) {
      alert("Insufficient balance.");
      return;
    }

    const payload = {
      user_id: Number(userId),
      payment_method: Number(paymentMethodId),
      amount: Number(withdrawAmount),
      currency: Number(currencyId),
    };

    try {
      setWithdrawLoading(true);
      await api.post("/api/payments/withdraw", payload);
      await loadBalance();

      setWithdrawAmount("");
      setPaymentMethodId("");
      setCurrencyId("");
      setShowWithdraw(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Withdraw failed");
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading dashboard…</div>;

  const balance = Number(wallet?.balance || 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* WALLET */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-3">Wallet</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 p-4 rounded shadow border-2 border-green-600">
            <p className="text-sm text-gray-500">Balance</p>
            <p className="text-2xl font-bold text-green-600">
              {balance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowDeposit(true)}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Deposit
          </button>

          <button
            onClick={() => setShowWithdraw(true)}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Views (recent days)</h3>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={analytics}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="views" stroke="#2563EB" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DEPOSIT MODAL */}
      {showDeposit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Deposit Funds</h3>

            <select
              className="border p-2 w-full mb-3 bg-white dark:bg-gray-900"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
            >
              <option value="">Select Payment Method</option>
              {paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.name}
                </option>
              ))}
            </select>

            <select
              className="border p-2 w-full mb-3 bg-white dark:bg-gray-900"
              value={currencyId}
              onChange={(e) => setCurrencyId(e.target.value)}
            >
              <option value="">Select Currency</option>
              {currencies.map((c) => (
                <option key={c.currency_id} value={c.currency_id}>
                  {c.currency_name}
                </option>
              ))}
            </select>

            <input
              className="border p-2 w-full mb-3 bg-white dark:bg-gray-900"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              type="number"
              className="border p-2 w-full mb-4 bg-white dark:bg-gray-900"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeposit(false)}
                className="px-4 py-2 text-gray-600 "
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={depositLoading}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                {depositLoading ? "Processing…" : "Deposit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>

            <select
              className="border p-2 w-full mb-3"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
            >
              <option value="">Select Payment Method</option>
              {paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.name}
                </option>
              ))}
            </select>

            <select
              className="border p-2 w-full mb-3"
              value={currencyId}
              onChange={(e) => setCurrencyId(e.target.value)}
            >
              <option value="">Select Currency</option>
              {currencies.map((c) => (
                <option key={c.currency_id} value={c.currency_id}>
                  {c.currency_name}
                </option>
              ))}
            </select>

            <input
              type="number"
              className="border p-2 w-full mb-4"
              placeholder="Amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowWithdraw(false)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                {withdrawLoading ? "Processing…" : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
