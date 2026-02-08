import { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { publicApi } from '../../publicApi';

interface PaymentMethod {
  id: number;
  name: string;
}

interface RawPaymentMethod {
  id?: number;
  method_id?: number;
  payment_method_id?: number;
  name: string;
}

interface Currency {
  currency_id: number;
  currency_name: string;
}

interface DonationProps {
  artistId: number;
}

const Donation: React.FC<DonationProps> = ({ artistId }) => {
  const [show, setShow] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [names, setNames] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [loading, setLoading] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [pmOpen, setPmOpen] = useState(false);
  const [curOpen, setCurOpen] = useState(false);

  useEffect(() => {
    publicApi.get('/api/settings/paymentMethods').then((res) => {
      const raw: RawPaymentMethod[] = res.data?.data || [];

      setPaymentMethods(
        raw
          .map((pm): PaymentMethod | null => {
            const id = pm.method_id ?? pm.payment_method_id ?? pm.id;
            return typeof id === 'number' ? { id, name: pm.name } : null;
          })
          .filter((pm): pm is PaymentMethod => pm !== null)
      );
    });

    publicApi.get('/api/currencies/all').then((res) => {
      setCurrencies(res.data?.data || []);
    });
  }, []);

  useEffect(() => {
    if (!show) return;

    const handleClose = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShow(false);
        setPmOpen(false);
        setCurOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClose);
    return () => document.removeEventListener('mousedown', handleClose);
  }, [show]);

  const handleDonate = async () => {
    if (loading) return;

    // Trim all inputs for validation
    const trimmedAmount = amount.trim();
    const trimmedPhone = phone.trim();
    const trimmedNames = names.trim();
    const trimmedEmail = email.trim();

    if (
      !trimmedAmount ||
      !trimmedPhone ||
      !trimmedNames ||
      !trimmedEmail ||
      !paymentMethodId ||
      !currencyId
    ) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      const res = await publicApi.post('/api/payments/init-sponsorship', {
        artist_id: Number(artistId),
        payment_methods: Number(paymentMethodId),
        amount: Number(trimmedAmount),
        phone: trimmedPhone,
        names: trimmedNames,
        email: trimmedEmail,
        currency: Number(currencyId),
      });

      toast.success('The bless initiated successfully');

      if (res.data?.data?.payment_url) {
        window.location.href = res.data.data.payment_url;
      }

      setShow(false);
      setAmount('');
      setPhone('');
      setNames('');
      setEmail('');
      setPaymentMethodId('');
      setCurrencyId('');
      setPmOpen(false);
      setCurOpen(false);
    } catch (err) {
      // Better type safety for error object
      if (err && typeof err === 'object' && 'response' in err) {
        toast.error(
          (err as any).response?.data?.message || 'Donation failed'
        );
      } else {
        toast.error('Donation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <button
        type="button"
        onClick={() => setShow(true)}
        className="bg-yellow-400 px-4 py-2 rounded font-bold text-black hover:bg-yellow-300 transition cursor-pointer"
        aria-haspopup="dialog"
        aria-expanded={show}
        aria-controls="donation-modal"
      >
        Bless
      </button>

      {show && (
        <div
          id="donation-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        >
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md p-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Support this Artist
            </h3>

            {/* Payment Method */}
            <button
              type="button"
              className="w-full border p-2 rounded mb-3 text-left cursor-pointer"
              onClick={() => setPmOpen(!pmOpen)}
              aria-expanded={pmOpen}
              aria-controls="payment-method-list"
            >
              {paymentMethodId
                ? paymentMethods.find(
                    (p) => p.id === Number(paymentMethodId)
                  )?.name
                : 'Select Payment Method'}
            </button>

            {pmOpen && (
              <ul
                id="payment-method-list"
                className=" rounded mb-3 max-h-40 overflow-y-auto dark:text-slate-100 dark:bg-gray-800"
              >
                {paymentMethods.map((pm) => (
                  <li
                    key={pm.id}
                    className="p-2 hover:bg-gray-300 hover:text-gray-800 cursor-pointer"
                    onClick={() => {
                      setPaymentMethodId(pm.id.toString());
                      setPmOpen(false);
                    }}
                    role="option"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setPaymentMethodId(pm.id.toString());
                        setPmOpen(false);
                      }
                    }}
                  >
                    {pm.name}
                  </li>
                ))}
              </ul>
            )}

            {/* Currency */}
            <button
              type="button"
              className="w-full border p-2 rounded mb-3 text-left cursor-pointer"
              onClick={() => setCurOpen(!curOpen)}
              aria-expanded={curOpen}
              aria-controls="currency-list"
            >
              {currencyId
                ? currencies.find(
                    (c) => c.currency_id === Number(currencyId)
                  )?.currency_name
                : 'Select Currency'}
            </button>

            {curOpen && (
              <ul
                id="currency-list"
                className=" rounded mb-3 max-h-40 overflow-y-auto dark:text-slate-100 dark:bg-gray-800"
              >
                {currencies.map((c) => (
                  <li
                    key={c.currency_id}
                    className="p-2 hover:bg-gray-300 hover:text-gray-800 cursor-pointer"
                    onClick={() => {
                      setCurrencyId(c.currency_id.toString());
                      setCurOpen(false);
                    }}
                    role="option"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setCurrencyId(c.currency_id.toString());
                        setCurOpen(false);
                      }
                    }}
                  >
                    {c.currency_name}
                  </li>
                ))}
              </ul>
            )}

            <input
              type="text"
              className="border p-2 rounded w-full mb-3 bg-gray-800"
              placeholder="Your names"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              aria-label="Your names"
            />

            <input
              type="email"
              className="border p-2 rounded w-full mb-3 bg-gray-800"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />

            <input
              type="tel"
              className="border p-2 rounded w-full mb-3 bg-gray-800"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-label="Phone number"
            />

            <input
              type="number"
              className="border p-2 rounded w-full mb-4 bg-gray-800"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Amount"
              min={0}
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShow(false)}
                className="px-4 py-2 text-sm bg-gray-800 rounded  text-slate-300 hover:text-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDonate}
                disabled={loading}
                className="bg-yellow-500 text-slate-900 hover:text-slate-700 px-4 py-2 rounded transition disabled:opacity-50"
              >
                {loading ? 'Processing…' : 'Bless'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Donation;
