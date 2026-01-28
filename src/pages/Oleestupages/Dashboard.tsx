import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api";

type PaymentMethod = { id: number; name: string };
type Currency = { currency_id: number; currency_name: string };

export default function Sdashboard() {
  const location = useLocation();

  const [wallet, setWallet] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [marketTab, setMarketTab] = useState<
    "holding" | "hot" | "new" | "favorite" | "gainers" | "volume"
  >("holding");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.user_id;

  /* ---------------- AUTO OPEN DEPOSIT ---------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("deposit") === "true") setShowDeposit(true);
  }, [location.search]);

  /* ---------------- LOAD BALANCE ---------------- */
  const loadBalance = async () => {
    const res = await api.get(`/api/payments/balance/${userId}`);
    setWallet(res.data.data);
  };

  /* ---------------- LOAD DASHBOARD ---------------- */
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadDashboard = async () => {
      try {
        const analyticsRes = await api.get("/api/studio/analytics");
        setAnalytics(analyticsRes.data?.data || []);
        await loadBalance();
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 text-white bg-[#0B0E11] min-h-screen">
        Loading dashboard…
      </div>
    );
  }

  const balance = Number(wallet?.balance || 0);

  return (
    <div className="p-6 bg-[#0B0E11] min-h-screen text-white space-y-8">

      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-yellow-400 rounded-full" />
        <div className="text-sm text-gray-400">
          <div>User-{userId}</div>
          <div>UID {userId}</div>
        </div>
        <div className="ml-auto text-sm">
          VIP Level <span className="text-white">Regular User</span>
        </div>
      </div>

      {/* ================= BALANCE + CHANNEL ANALYTICS ================= */}
      <div className="bg-[#12161C] rounded-xl p-6 flex justify-between gap-6">

        {/* LEFT SIDE */}
        <div>
          <p className="text-gray-400 text-sm">Estimated Balance</p>
          <h2 className="text-3xl font-bold">{balance.toFixed(4)} BTC</h2>
          <p className="text-red-500 text-sm mt-1">
            Today’s PnL −$0.01 (−14.25%)
          </p>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowDeposit(true)}
              className="px-4 py-2 bg-[#1D9BF0] rounded"
            >
              Deposit
            </button>
            <button
              onClick={() => setShowWithdraw(true)}
              className="px-4 py-2 bg-gray-700 rounded"
            >
              Withdraw
            </button>
            <button className="px-4 py-2 bg-gray-700 rounded">
              Cash In
            </button>
          </div>
        </div>

        {/* RIGHT SIDE – CHANNEL ANALYTICS */}
        <div className="w-[420px] bg-[#0E1116] rounded-lg p-4 text-sm">
          <h4 className="font-semibold mb-3">Channel analytics</h4>

          <div className="mb-4">
            <p className="text-gray-400">Current subscribers</p>
            <p className="text-xl font-bold">2,373</p>
            <p className="text-green-500 text-xs">+42 in last 28 days</p>
          </div>

          <div className="border-t border-[#1E2329] pt-3 mb-4">
            <p className="text-gray-400 text-xs">Summary</p>
            <p className="text-gray-500 text-xs">Last 28 days</p>

            <div className="flex justify-between mt-2">
              <span>Views</span>
              <span className="font-medium">10.0K</span>
            </div>
            <div className="flex justify-between">
              <span>Watch time (hours)</span>
              <span className="font-medium">242.8</span>
            </div>
          </div>

          <div className="border-t border-[#1E2329] pt-3">
            <p className="text-gray-400 text-xs mb-2">
              Top content · Last 48 hours
            </p>

            <div className="flex justify-between text-xs mb-1">
              <span className="truncate">Refined by Love, Not Burned...</span>
              <span>74</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="truncate">
                SONG OF SONGS | Episode 12
              </span>
              <span>24</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="truncate">
                What If the Fire of God Is Love?
              </span>
              <span>22</span>
            </div>

            <button className="mt-3 text-yellow-400 text-xs">
              Go to channel analytics →
            </button>
          </div>
        </div>
      </div>

      {/* ================= MARKETS ================= */}
      <div className="bg-[#12161C] border border-[#1E2329] rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Markets</h3>
          <span className="text-sm text-gray-400 cursor-pointer">More &gt;</span>
        </div>

        <div className="flex gap-6 text-sm text-gray-400 mb-4">
          {[
            ["holding", "Holding"],
            ["hot", "Hot"],
            ["new", "New Listing"],
            ["favorite", "Favorite"],
            ["gainers", "Top Gainers"],
            ["volume", "24h Volume"],
          ].map(([key, label]) => (
            <span
              key={key}
              onClick={() => setMarketTab(key as any)}
              className={`cursor-pointer pb-1 ${
                marketTab === key
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : ""
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="text-left">Coin</th>
              <th>Amount</th>
              <th>Coin Price / Cost Price</th>
              <th>24h Change</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {marketTab === "holding" && (
              <>
                <tr className="border-t border-[#1E2329]">
                  <td className="py-4">HMSTR</td>
                  <td className="text-center">185.37</td>
                  <td className="text-center">$0.00</td>
                  <td className="text-green-500 text-center">+5.17%</td>
                  <td className="text-yellow-400 text-right">Trade</td>
                </tr>
                <tr className="border-t border-[#1E2329]">
                  <td className="py-4">USDT</td>
                  <td className="text-center">0.00365139</td>
                  <td className="text-center">$1.00</td>
                  <td className="text-red-500 text-center">-0.02%</td>
                  <td className="text-yellow-400 text-right">Trade</td>
                </tr>
              </>
            )}

            {marketTab === "hot" && (
              <tr className="border-t border-[#1E2329]">
                <td className="py-4">BTC</td>
                <td className="text-center">—</td>
                <td className="text-center">$42,300</td>
                <td className="text-green-500 text-center">+3.41%</td>
                <td className="text-yellow-400 text-right">Trade</td>
              </tr>
            )}

            {marketTab === "new" && (
              <tr className="border-t border-[#1E2329]">
                <td className="py-4">NEWCOIN</td>
                <td className="text-center">—</td>
                <td className="text-center">$0.012</td>
                <td className="text-green-500 text-center">+120%</td>
                <td className="text-yellow-400 text-right">Trade</td>
              </tr>
            )}

            {marketTab === "favorite" && (
              <tr className="border-t border-[#1E2329]">
                <td className="py-4">ETH</td>
                <td className="text-center">—</td>
                <td className="text-center">$2,320</td>
                <td className="text-red-500 text-center">-1.12%</td>
                <td className="text-yellow-400 text-right">Trade</td>
              </tr>
            )}

            {marketTab === "gainers" && (
              <tr className="border-t border-[#1E2329]">
                <td className="py-4">SOL</td>
                <td className="text-center">—</td>
                <td className="text-center">$98.45</td>
                <td className="text-green-500 text-center">+18.7%</td>
                <td className="text-yellow-400 text-right">Trade</td>
              </tr>
            )}

            {marketTab === "volume" && (
              <tr className="border-t border-[#1E2329]">
                <td className="py-4">BTC</td>
                <td className="text-center">—</td>
                <td className="text-center">$42,300</td>
                <td className="text-gray-400 text-center">High Volume</td>
                <td className="text-yellow-400 text-right">Trade</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= DISCOVER / EARN ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#12161C] rounded-xl p-6">
          <h3 className="font-semibold mb-4">Discover</h3>

          <table className="w-full text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="text-left">Coin</th>
                <th>Est. APR</th>
                <th>Duration</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {[
                ["ETH", "1.39% - 170.70%", "flexible / locked"],
                ["SOL", "1.80% - 153.40%", "flexible / locked"],
                ["XUSD", "3.50%", "flexible"],
                ["FDUSD", "0.32%", "flexible"],
              ].map(([coin, apr, duration]) => (
                <tr key={coin} className="border-t border-gray-800">
                  <td className="py-3">{coin}</td>
                  <td className="text-green-500">{apr}</td>
                  <td>{duration}</td>
                  <td className="text-yellow-400 cursor-pointer">
                    Subscribe
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-[#12161C] rounded-xl p-6">
            <h3 className="font-semibold">Announcements</h3>
          </div>
          <div className="bg-[#12161C] rounded-xl p-6">
            <p className="text-xs text-gray-400">EARN TOGETHER</p>
            <h4 className="text-yellow-400 font-semibold">
              Unlock Up to 1,000 USDC
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}
