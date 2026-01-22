import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api";

import DataTable from "../../components/DataTable";
import { exportExcel } from "../../utils/exportExcel";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

type Wallet = {
  balance: number;
  currency: string;
};

type Stats = {
  totalUsers?: number;
  totalDeposits?: number;
  totalWithdrawals?: number;
};

type AnalyticsItem = {
  date: string;
  views: number;
};

type AuditLog = {
  id: number;
  user: string;
  action: string;
  details: string;
  timestamp: string;
};

type SuspiciousLogin = {
  id: number;
  user: string;
  ip: string;
  timestamp: string;
};

// -----------------------------
export default function Fdashboard() {
  // -----------------------------
  // State
  // -----------------------------
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [suspiciousLogins, setSuspiciousLogins] = useState<SuspiciousLogin[]>([]);

  // Monthly trends
  const [range, setRange] = useState("3m");

  const monthlyTrends = [
    { date: "Apr 3", income: 320, expenses: 180 },
    { date: "Apr 10", income: 420, expenses: 260 },
    { date: "Apr 17", income: 500, expenses: 300 },
    { date: "Apr 24", income: 380, expenses: 240 },
    { date: "May 1", income: 520, expenses: 310 },
    { date: "May 8", income: 610, expenses: 420 },
    { date: "May 15", income: 580, expenses: 390 },
    { date: "May 23", income: 460, expenses: 280 },
    { date: "May 31", income: 640, expenses: 410 },
    { date: "Jun 7", income: 700, expenses: 460 },
    { date: "Jun 14", income: 680, expenses: 430 },
    { date: "Jun 21", income: 740, expenses: 490 },
    { date: "Jun 30", income: 800, expenses: 520 },
  ];

  const userSession = localStorage.getItem("user");
  const user = userSession ? JSON.parse(userSession) : null;
  const userId = user?.user_id;
  const location = useLocation();

  const balance = Number(wallet?.balance || 0);

  // -----------------------------
  // Load wallet balance
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
  // Load dashboard & analytics
  useEffect(() => {
    if (!userId) return;

    const loadDashboard = async () => {
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
    };

    loadDashboard();
    loadBalance();

    api
      .get("/api/settings/paymentMethods")
      .then((res) => {
        const raw: PaymentMethodRaw[] = res.data?.data || [];
        const normalized: PaymentMethod[] = raw
          .map((pm) => {
            const id = pm.method_id ?? pm.payment_method_id ?? pm.id;
            if (typeof id !== "number") return null;
            return { id, name: pm.name };
          })
          .filter((pm): pm is PaymentMethod => pm !== null);
        setPaymentMethods(normalized);
      })
      .catch(console.error);

    api
      .get("/api/currencies/all")
      .then((res) => setCurrencies(res.data.data || []))
      .catch(console.error);

    setAuditLogs([
      { id: 1, user: "Alice", action: "Deposit", details: "$100", timestamp: "2026-01-22 10:00" },
      { id: 2, user: "Bob", action: "Withdraw", details: "$50", timestamp: "2026-01-22 11:00" },
    ]);

    setSuspiciousLogins([
      { id: 1, user: "Alice", ip: "192.168.1.5", timestamp: "2026-01-22 09:50" },
      { id: 2, user: "Charlie", ip: "10.0.0.7", timestamp: "2026-01-22 11:30" },
    ]);
  }, [userId]);

  if (loading) return <div className="p-6">Loading dashboard…</div>;

  // -----------------------------
  // Render
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow border border-green-100">
          <p className="text-gray-500 text-sm">Total Income</p>
          <h2 className="text-2xl font-bold">$7.8k</h2>
        </div>

        <div className="bg-white p-4 rounded shadow border border-blue-100">
          <p className="text-gray-500 text-sm">Total Expense</p>
          <h2 className="text-2xl font-bold">$4.3k</h2>
        </div>

        <div className="bg-white p-4 rounded shadow border border-orange-100">
          <p className="text-gray-500 text-sm">Total Savings</p>
          <h2 className="text-2xl font-bold">$5.6k</h2>
        </div>

        <div className="bg-white p-4 rounded shadow border border-purple-100">
          <p className="text-gray-500 text-sm">Total Investment</p>
          <h2 className="text-2xl font-bold">$3.75k</h2>
        </div>
      </div>

         {/* WALLET */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Wallet</h3>
        <div className="border-2 border-green-600 p-4 rounded">
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-2xl font-bold text-green-600">{balance.toLocaleString()}</p>
        </div>
      </div>

      

    {/* AUDIT LOGS */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2 flex justify-between items-center">
          Transactions Activities
          <button
            onClick={() => exportExcel(auditLogs, "audit-logs")}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Export CSV
          </button>
        </h3>
        <DataTable
          columns={[
            { key: "timestamp", label: "Timestamp" },
            { key: "user", label: "User" },
            { key: "action", label: "Action" },
            { key: "details", label: "Details" },
          ]}
          data={auditLogs}
        />
      </div>

      {/* SUSPICIOUS LOGINS */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2 flex justify-between items-center">
          Suspicious Logins
          <button
            onClick={() => exportExcel(suspiciousLogins, "suspicious-logins")}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Export CSV
          </button>
        </h3>
        <DataTable
          columns={[
            { key: "user", label: "User" },
            { key: "ip", label: "IP Address" },
            { key: "timestamp", label: "Timestamp" },
          ]}
          data={suspiciousLogins}
        />
      </div>

{/* MONTHLY TRENDS */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold">Monthly Trends</h3>
            <p className="text-sm text-gray-500">Income vs. expenses over time</p>
          </div>

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="3m">Last 3 months</option>
            <option value="30d">Last 30 days</option>
            <option value="7d">Last 7 days</option>
          </select>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="income" stroke="#14532d" fill="#16a34a" fillOpacity={0.5} />
              <Area type="monotone" dataKey="expenses" stroke="#166534" fill="#22c55e" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
     
    </div>
  );
}
