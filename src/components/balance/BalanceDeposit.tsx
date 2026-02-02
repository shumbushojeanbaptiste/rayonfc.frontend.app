import { useEffect, useState, useRef } from 'react';
import api from '../../api';
import { Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

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

  const modalRef = useRef<HTMLDivElement | null>(null);

  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [loading, setLoading] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // New states for dropdown open/close
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

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

  useEffect(() => {
    if (!showDeposit) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowDeposit(false);
        setPaymentOpen(false);
        setCurrencyOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDeposit]);

  const handleDeposit = async () => {
    if (!amount || !phone || !paymentMethodId || !currencyId) {
      toast.error('Please fill all fields');
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
      setPaymentOpen(false);
      setCurrencyOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
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
          className="hidden sm:inline-block bg-[#FFFF00] px-2 py-1 text-xs rounded-md sm:px-3 sm:py-1.5 sm:text-sm font-bold text-black hover:bg-[#D1D100] transition"
        >
          DEPOSIT
        </button>

        <button
          onClick={() => setShowDeposit(true)}
          aria-label="Deposit"
          className="inline-flex sm:hidden items-center justify-center rounded-full bg-[#FFFF00] w-8 h-8 text-black hover:bg-[#D1D100] transition shadow"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* DEPOSIT MODAL */}
      {showDeposit && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 mt-15"
          aria-modal="true"
          role="dialog"
          aria-labelledby="deposit-modal-title"
        >
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-6"
            style={{ margin: 'auto' }}
          >
            <h3
              id="deposit-modal-title"
              className="text-lg font-semibold mb-4 text-gray-900 dark:text-white"
            >
              Deposit Funds
            </h3>

            {/* PAYMENT METHOD CUSTOM DROPDOWN */}
            <div className="mb-3 relative">
              <div className="border rounded bg-white dark:bg-gray-900">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm sm:text-base"
                  onClick={() => setPaymentOpen(!paymentOpen)}
                >
                  {paymentMethodId
                    ? paymentMethods.find((pm) => pm.id === Number(paymentMethodId))
                        ?.name
                    : 'Select Payment Method'}
                </button>

                {paymentOpen && (
                  <ul className="absolute z-50 w-full max-h-40 overflow-y-auto border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b shadow-lg">
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
            </div>

            {/* CURRENCY CUSTOM DROPDOWN */}
            <div className="mb-3 relative">
              <div className="border rounded bg-white dark:bg-gray-900">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm sm:text-base"
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                >
                  {currencyId
                    ? currencies.find((c) => c.currency_id === Number(currencyId))
                        ?.currency_name
                    : 'Select Currency'}
                </button>

                {currencyOpen && (
                  <ul className="absolute z-50 w-full max-h-40 overflow-y-auto border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b shadow-lg">
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
            </div>

            <input
              className="border p-2 text-sm w-full mb-3 bg-white dark:bg-gray-900 rounded"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              type="number"
              className="border p-2 text-sm w-full mb-4 bg-white dark:bg-gray-900 rounded"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeposit(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDeposit}
                disabled={loading}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
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
