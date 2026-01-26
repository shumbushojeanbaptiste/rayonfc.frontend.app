import { useEffect, useState } from 'react';
import api from '../../api';

interface Wallet {
  balance: number;
  currency: string;
}

interface PaymentMethod {
  id: number;
  name: string;
}

interface Currency {
  currency_id: number;
  currency_name: string;
}

interface BalanceDepositProps {
  variant?: 'inline' | 'block';
}

const BalanceDeposit: React.FC<BalanceDepositProps> = ({ variant = 'inline' }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);

  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [loading, setLoading] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return null;
    }
  })();

  const userId = user?.user_id;

  const loadBalance = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/api/payments/balance/${userId}`);
      setWallet(res.data.data);
    } catch (err) {
      console.error('Balance load failed:', err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadBalance();
    const interval = setInterval(loadBalance, 30_000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    api.get('/api/settings/paymentMethods').then((res) => {
      const raw = res.data?.data || [];
      setPaymentMethods(
        raw
          .map((pm: any) => {
            const id = pm.method_id ?? pm.payment_method_id ?? pm.id;
            return typeof id === 'number' ? { id, name: pm.name } : null;
          })
          .filter(Boolean)
      );
    });

    api.get('/api/currencies/all').then((res) => {
      setCurrencies(res.data.data || []);
    });
  }, []);

  const handleDeposit = async () => {
    if (!amount || !phone || !paymentMethodId || !currencyId) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/payments/init-deposit', {
        user_id: Number(userId),
        payment_methods: Number(paymentMethodId),
        amount: Number(amount),
        phone: phone.trim(),
        currency: Number(currencyId),
      });

      await loadBalance();
      setShowDeposit(false);
      setAmount('');
      setPhone('');
      setPaymentMethodId('');
      setCurrencyId('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BALANCE BAR */}
      <div
        className={
          variant === 'inline'
            ? 'inline-flex items-center rounded-md bg-[#2b2f33] text-xs sm:text-[13px]'
            : 'flex items-center justify-between rounded-md bg-[#2b2f33] px-2 py-1 sm:px-3 sm:py-2'
        }
      >
        <div className="px-2 py-1 font-semibold rounded-md text-white sm:px-3 sm:py-1.5">
          {(wallet?.balance || 0).toLocaleString()} RWF
        </div>

        <button
          onClick={() => setShowDeposit(true)}
          className="bg-[#FFFF00] px-2 py-1 text-xs rounded-md sm:px-3 sm:py-1.5 sm:text-sm font-bold text-black  hover:bg-[#D1D100] transition"
        >
          DEPOSIT
        </button>
      </div>

      {/* DEPOSIT MODAL */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center sm:items-start justify-center p-3 sm:pt-24">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 p-4 sm:p-6 rounded shadow max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Deposit Funds
            </h3>

            <select
              className="border p-2 text-sm w-full mb-2 sm:mb-3 bg-white dark:bg-gray-900"
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
              className="border p-2 text-sm w-full mb-2 sm:mb-3 bg-white dark:bg-gray-900"
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
              className="border p-2 text-sm w-full mb-2 sm:mb-3 bg-white dark:bg-gray-900"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              type="number"
              className="border p-2 text-sm w-full mb-3 sm:mb-4 bg-white dark:bg-gray-900"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeposit(false)}
                className="px-3 py-1.5 text-sm text-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleDeposit}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded"
              >
                {loading ? 'Processing…' : 'Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BalanceDeposit;
