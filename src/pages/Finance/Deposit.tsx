import React, { useEffect, useState, useRef } from "react";
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

export default function Deposit() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Deposit modal states
  // -----------------------------
  const [showDeposit, setShowDeposit] = useState(false);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);

  // Custom dropdown + modal refs (NEW)
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // -----------------------------
  // DB data
  // -----------------------------
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // -----------------------------
  // Deposit history
  // -----------------------------
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [sortField, setSortField] = useState<keyof DepositRecord>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // -----------------------------
  // User
  // -----------------------------
  const userSession = localStorage.getItem("user");
  const user = userSession ? JSON.parse(userSession) : null;
  const userId = user?.user_id;
  const location = useLocation();

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
      const normalized = raw
        .map((pm) => {
          const id = pm.method_id ?? pm.payment_method_id ?? pm.id;
          return typeof id === "number" ? { id, name: pm.name } : null;
        })
        .filter(Boolean) as PaymentMethod[];
      setPaymentMethods(normalized);
    });

    api
      .get("/api/currencies/all")
      .then((res) => setCurrencies(res.data.data || []))
      .catch(console.error);
  }, []);

  // -----------------------------
  // CLOSE MODAL ON OUTSIDE CLICK
  // -----------------------------
  useEffect(() => {
    if (!showDeposit) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowDeposit(false);
        setPaymentOpen(false);
        setCurrencyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDeposit]);

  // -----------------------------
  // Deposit handler
  // -----------------------------
  const handleDeposit = async () => {
    if (!amount || !phone || !paymentMethodId || !currencyId) {
      alert("Please fill all deposit fields.");
      return;
    }

    try {
      setDepositLoading(true);
      await api.post("/api/payments/init-deposit", {
        user_id: Number(userId),
        payment_methods: Number(paymentMethodId),
        amount: Number(amount),
        phone: phone.trim(),
        currency: Number(currencyId),
      });

      await loadBalance();
      setShowDeposit(false);
      setAmount("");
      setPhone("");
      setPaymentMethodId("");
      setCurrencyId("");
      setPaymentOpen(false);
      setCurrencyOpen(false);
      loadDeposits();
    } catch (err: any) {
      alert(err.response?.data?.message || "Deposit failed");
    } finally {
      setDepositLoading(false);
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
          <div className="bg-slate-50 dark:bg-gray-700 p-4 rounded shadow-5">
            <p className="text-sm text-gray-400">Available Balance</p>
            <p className="flex gap-1 text-2xl font-bold text-green-800 dark:text-green-700">
              <h4>{balance.toLocaleString()}</h4>
              <p className="text-sm mt-2">RWF</p>
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-gray-700 p-4 rounded shadow-5">
            <p className="text-sm text-gray-400">Total Income</p>
            <p className="flex gap-1 text-2xl font-bold text-green-800 dark:text-green-700">
              <h4>{balance.toLocaleString()}</h4>
              <p className="text-sm mt-2">RWF</p>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDeposit(true)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Deposit
        </button>
      </div>

      {/* DEPOSIT HISTORY TABLE */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
        <h3 className="font-semibold mb-4">Deposit History</h3>

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

      {/* DEPOSIT MODAL */}
      {showDeposit && (
        <div className="fixed  inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-sm w-full p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Deposit Funds</h3>

            {/* PAYMENT METHOD DROPDOWN */}
            <div className="mb-3 relative">
              <button
                type="button"
                className="w-full border p-2 text-left rounded bg-white dark:bg-gray-900"
                onClick={() => setPaymentOpen(!paymentOpen)}
              >
                {paymentMethodId
                  ? paymentMethods.find(
                      (p) => p.id === Number(paymentMethodId)
                    )?.name
                  : "Select Payment Method"}
              </button>

              {paymentOpen && (
                <ul className="absolute z-50 w-full max-h-40 overflow-y-auto bg-white dark:bg-gray-900 border rounded shadow">
                  {paymentMethods.map((pm) => (
                    <li
                      key={pm.id}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setPaymentMethodId(pm.id.toString());
                        setPaymentOpen(false);
                      }}
                    >
                      {pm.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CURRENCY DROPDOWN */}
            <div className="mb-3 relative">
              <button
                type="button"
                className="w-full border p-2 text-left rounded bg-white dark:bg-gray-900"
                onClick={() => setCurrencyOpen(!currencyOpen)}
              >
                {currencyId
                  ? currencies.find(
                      (c) => c.currency_id === Number(currencyId)
                    )?.currency_name
                  : "Select Currency"}
              </button>

              {currencyOpen && (
                <ul className="absolute z-50 w-full max-h-40 overflow-y-auto bg-white dark:bg-gray-900 border rounded shadow">
                  {currencies.map((c) => (
                    <li
                      key={c.currency_id}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setCurrencyId(c.currency_id.toString());
                        setCurrencyOpen(false);
                      }}
                    >
                      {c.currency_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              className="border p-2 w-full mb-3 rounded bg-white dark:bg-gray-900"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              type="number"
              className="border p-2 w-full mb-4 rounded bg-white dark:bg-gray-900"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeposit(false)}
                className="text-gray-600"
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
    </div>
  );
}
