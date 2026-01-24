import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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

type DepositRecord = {
  id: number;
  amount: number;
  currency: string;
  payment_method: string;
  phone: string;
  status: string;
  date: string;
};

export default function Withdraw() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Withdraw modal
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [currencyId, setCurrencyId] = useState("");

  // DB data
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // Deposit history
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [sortField, setSortField] = useState<keyof DepositRecord>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Signed user
  const userSession = localStorage.getItem("user");
  const user = userSession ? JSON.parse(userSession) : null;
  const userId = user?.user_id;
  const location = useLocation();

  // -----------------------------
  // Load wallet balance
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
  // Load payment methods & currencies
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

    api
      .get("/api/currencies/all")
      .then((res) => setCurrencies(res.data.data || []))
      .catch((err) => console.error(err));
  }, []);

  // -----------------------------
  // Withdraw handler
  // -----------------------------
  const handleWithdraw = async () => {
    if (!withdrawAmount || !paymentMethodId || !currencyId) {
      alert("Please fill all withdraw fields.");
      return;
    }

    const balance = Number(wallet?.balance || 0);
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
      loadDeposits();
    } catch (err: any) {
      alert(err.response?.data?.message || "Withdraw failed");
    } finally {
      setWithdrawLoading(false);
    }
  };

  // -----------------------------
  // Load deposit history
  // -----------------------------
  const loadDeposits = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/api/payments/deposits/${userId}`);
      setDeposits(res.data.data || []);
    } catch (err) {
      console.error("Deposit history load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
    loadDeposits();
  }, [userId]);

  // -----------------------------
  // Sorting & Pagination
  // -----------------------------
  const sortedDeposits = [...deposits].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedDeposits.length / itemsPerPage);
  const currentItems = sortedDeposits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const balance = Number(wallet?.balance || 0);

  if (loading) return <div className="p-6">Loading dashboard…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* WALLET */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-3">Wallet</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded shadow-5">
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="flex gap-1 text-2xl font-bold text-green-800 dark:text-green-700">
              <h4>{balance.toLocaleString()}</h4> 
              <p className="text-sm mt-2">RWF</p>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowWithdraw(true)}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* DEPOSIT HISTORY TABLE */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
        <h3 className="font-semibold mb-4"> Withdraw History</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {[
                { label: "Date", key: "date" },
                { label: "Amount", key: "amount" },
                { label: "Currency", key: "currency" },
                { label: "Payment Method", key: "payment_method" },
                { label: "Phone", key: "phone" },
                { label: "Status", key: "status" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => {
                    if (sortField === col.key) {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortField(col.key as keyof DepositRecord);
                      setSortOrder("asc");
                    }
                  }}
                  className="cursor-pointer border-b p-2"
                >
                  {col.label}{" "}
                  {sortField === col.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((dep) => (
              <tr key={dep.id} className="hover:bg-gray-100">
                <td className="border-b p-2">{dep.date}</td>
                <td className="border-b p-2">{dep.amount}</td>
                <td className="border-b p-2">{dep.currency}</td>
                <td className="border-b p-2">{dep.payment_method}</td>
                <td className="border-b p-2">{dep.phone}</td>
                <td className="border-b p-2">{dep.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between mt-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

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
