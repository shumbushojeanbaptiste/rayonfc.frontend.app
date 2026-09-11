import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import api from "../../api";
import {
  Plus,
  Check,
  CreditCard,
  Smartphone,
  Wallet,
  X,
  ShieldCheck,
  ChevronDown,
  LockKeyhole,
  Banknote,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

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

type WalletData = {
  balance: number;
  currency?: string;
};

// ============================================================
// MODULE-LEVEL CACHE
// These survive component remounts while the app is running.
// ============================================================

let paymentMethodsCache: PaymentMethod[] | null = null;
let currenciesCache: Currency[] | null = null;

let depositSettingsPromise:
  | Promise<{
      paymentMethods: PaymentMethod[];
      currencies: Currency[];
    }>
  | null = null;

// ============================================================
// LOAD PAYMENT METHODS + CURRENCIES
// ============================================================

const loadDepositSettings = async () => {
  // Already cached
  if (
    paymentMethodsCache !== null &&
    currenciesCache !== null
  ) {
    return {
      paymentMethods: paymentMethodsCache,
      currencies: currenciesCache,
    };
  }

  // Another component/request is already loading them
  if (depositSettingsPromise) {
    return depositSettingsPromise;
  }

  depositSettingsPromise = Promise.all([
    api.get("/api/settings/paymentMethods"),
    api.get("/api/currencies/all"),
  ])
    .then(([paymentMethodsRes, currenciesRes]) => {
      const raw: PaymentMethodRaw[] =
        paymentMethodsRes.data?.data || [];

      const normalized = raw
        .map((pm) => {
          const id =
            pm.method_id ??
            pm.payment_method_id ??
            pm.id;

          return typeof id === "number"
            ? {
                id,
                name: pm.name,
              }
            : null;
        })
        .filter(Boolean) as PaymentMethod[];

      const currencies: Currency[] =
        currenciesRes.data?.data || [];

      paymentMethodsCache = normalized;
      currenciesCache = currencies;

      return {
        paymentMethods: normalized,
        currencies,
      };
    })
    .finally(() => {
      depositSettingsPromise = null;
    });

  return depositSettingsPromise;
};

export default function Deposit() {
  // -----------------------------
  // Wallet
  // -----------------------------
  const [wallet, setWallet] =
    useState<WalletData | null>(null);

  const [loading, setLoading] =
    useState(true);

  // -----------------------------
  // Deposit modal
  // -----------------------------
  const [showDeposit, setShowDeposit] =
    useState(false);

  const [amount, setAmount] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [paymentMethodId, setPaymentMethodId] =
    useState("");

  const [currencyId, setCurrencyId] =
    useState("");

  const [depositLoading, setDepositLoading] =
    useState(false);

  // -----------------------------
  // Dropdown state
  // -----------------------------
  const [currencyOpen, setCurrencyOpen] =
    useState(false);

  // -----------------------------
  // Modal ref
  // -----------------------------
  const modalRef =
    useRef<HTMLDivElement | null>(null);

  // -----------------------------
  // DB data
  // -----------------------------
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(
      paymentMethodsCache || []
    );

  const [currencies, setCurrencies] =
    useState<Currency[]>(
      currenciesCache || []
    );

  // -----------------------------
  // Request protection
  // -----------------------------
  const balanceLoadingRef =
    useRef(false);

  const depositsLoadingRef =
    useRef(false);

  const depositSettingsLoadingRef =
    useRef(false);

  const depositSettingsLoadedRef =
    useRef(
      paymentMethodsCache !== null &&
        currenciesCache !== null
    );

  // -----------------------------
  // Deposit history
  // -----------------------------
  const [deposits, setDeposits] =
    useState<DepositRecord[]>([]);

  const [sortField, setSortField] =
    useState<keyof DepositRecord>("date");

  const [sortOrder, setSortOrder] =
    useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 5;

  // -----------------------------
  // User
  // -----------------------------
  const userSession =
    localStorage.getItem("user");

  const user = (() => {
    try {
      return userSession
        ? JSON.parse(userSession)
        : null;
    } catch {
      return null;
    }
  })();

  const userId = user?.user_id;

  const location = useLocation();

  // ============================================================
  // LOAD WALLET BALANCE
  // ============================================================

  const loadBalance = useCallback(async () => {
    if (!userId) return;

    if (balanceLoadingRef.current) {
      return;
    }

    balanceLoadingRef.current = true;

    try {
      const res = await api.get(
        `/api/payments/balance/${userId}`
      );

      setWallet(
        res.data?.data || null
      );
    } catch (err) {
      console.error(
        "Balance load failed:",
        err
      );
    } finally {
      balanceLoadingRef.current = false;
    }
  }, [userId]);

  // ============================================================
  // LOAD DEPOSIT SETTINGS
  // ============================================================

  const loadDepositData =
    useCallback(async () => {
      // Already loaded
      if (
        depositSettingsLoadedRef.current &&
        paymentMethodsCache !== null &&
        currenciesCache !== null
      ) {
        return;
      }

      // Prevent duplicate calls
      if (
        depositSettingsLoadingRef.current
      ) {
        return;
      }

      depositSettingsLoadingRef.current = true;

      try {
        const data =
          await loadDepositSettings();

        setPaymentMethods(
          data.paymentMethods
        );

        setCurrencies(
          data.currencies
        );

        depositSettingsLoadedRef.current =
          true;
      } catch (err) {
        console.error(
          "Deposit settings load failed:",
          err
        );

        toast.error(
          "Unable to load deposit information"
        );
      } finally {
        depositSettingsLoadingRef.current =
          false;
      }
    }, []);

  // ============================================================
  // LOAD DEPOSIT HISTORY
  // ============================================================

  const loadDeposits =
    useCallback(async () => {
      if (!userId) return;

      if (depositsLoadingRef.current) {
        return;
      }

      depositsLoadingRef.current = true;

      try {
        const res = await api.get(
          `/api/payments/deposits/${userId}`
        );

        setDeposits(
          res.data?.data || []
        );
      } catch (err) {
        console.error(
          "Deposit history load failed:",
          err
        );
      } finally {
        depositsLoadingRef.current = false;
        setLoading(false);
      }
    }, [userId]);

  // ============================================================
  // AUTO OPEN DEPOSIT MODAL
  // ============================================================

  useEffect(() => {
    const params =
      new URLSearchParams(
        location.search
      );

    if (
      params.get("deposit") === "true"
    ) {
      setShowDeposit(true);
    }
  }, [location.search]);

  // ============================================================
  // INITIAL DATA LOAD
  //
  // ONLY:
  // 1 balance request
  // 1 deposit history request
  //
  // NO POLLING
  // ============================================================

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadBalance();
    loadDeposits();
  }, [
    userId,
    loadBalance,
    loadDeposits,
  ]);

  // ============================================================
  // REFRESH BALANCE / HISTORY WHEN TAB BECOMES VISIBLE
  //
  // This replaces continuous polling.
  // ============================================================

  useEffect(() => {
    if (!userId) return;

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          loadBalance();
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [userId, loadBalance]);

  // ============================================================
  // OPEN DEPOSIT MODAL
  // ============================================================

  const openDeposit = async () => {
    if (!userId) {
      toast.error(
        "User session not found"
      );
      return;
    }

    // Refresh current balance when user
    // actually wants to make a deposit.
    await loadBalance();

    // Load settings only if not already cached.
    await loadDepositData();

    setShowDeposit(true);
  };

  // ============================================================
  // AUTO-OPEN MODAL SETTINGS
  //
  // If URL contains ?deposit=true,
  // make sure settings are available.
  // ============================================================

  useEffect(() => {
    const params =
      new URLSearchParams(
        location.search
      );

    if (
      params.get("deposit") === "true"
    ) {
      if (userId) {
        loadDepositData();
        loadBalance();
      }
    }
  }, [
    location.search,
    userId,
    loadDepositData,
    loadBalance,
  ]);

  // ============================================================
  // LOAD SETTINGS WHEN MODAL OPENS
  //
  // Useful for normal button opening.
  // Cache prevents repeated API calls.
  // ============================================================

  useEffect(() => {
    if (!showDeposit) return;

    loadDepositData();
    loadBalance();
  }, [
    showDeposit,
    loadDepositData,
    loadBalance,
  ]);

  // ============================================================
  // PREVENT BACKGROUND SCROLL WHEN MODAL IS OPEN
  // ============================================================

  useEffect(() => {
    if (!showDeposit) return;

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [showDeposit]);

  // ============================================================
  // ESCAPE KEY
  // ============================================================

  useEffect(() => {
    if (!showDeposit) return;

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape" &&
        !depositLoading
      ) {
        setShowDeposit(false);
        setCurrencyOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    showDeposit,
    depositLoading,
  ]);

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    if (depositLoading) return;

    setShowDeposit(false);
    setCurrencyOpen(false);
  };

  // ============================================================
  // DEPOSIT HANDLER
  // ============================================================

  const handleDeposit = async () => {
    if (
      !amount ||
      !phone ||
      !paymentMethodId ||
      !currencyId
    ) {
      toast.error(
        "Please fill all fields"
      );
      return;
    }

    const numericAmount =
      Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      toast.error(
        "Please enter a valid amount"
      );
      return;
    }

    if (!userId) {
      toast.error(
        "User session not found"
      );
      return;
    }

    if (depositLoading) {
      return;
    }

    try {
      setDepositLoading(true);

      await api.post(
        "/api/payments/init-deposit",
        {
          user_id: Number(userId),
          payment_methods:
            Number(paymentMethodId),
          amount: numericAmount,
          phone: phone.trim(),
          currency:
            Number(currencyId),
        }
      );

      // Refresh only after successful deposit.
      await Promise.all([
        loadBalance(),
        loadDeposits(),
      ]);

      setShowDeposit(false);

      setAmount("");
      setPhone("");
      setPaymentMethodId("");
      setCurrencyId("");
      setCurrencyOpen(false);

      setCurrentPage(1);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Deposit failed"
      );
    } finally {
      setDepositLoading(false);
    }
  };

  // ============================================================
  // SELECTED PAYMENT METHOD
  // ============================================================

  const selectedPaymentMethod =
    paymentMethods.find(
      (pm) =>
        pm.id ===
        Number(paymentMethodId)
    );

  // ============================================================
  // SELECTED CURRENCY
  // ============================================================

  const selectedCurrency =
    currencies.find(
      (currency) =>
        currency.currency_id ===
        Number(currencyId)
    );

  // ============================================================
  // PAYMENT ICON
  // ============================================================

  const getPaymentIcon = (
    name: string
  ) => {
    const lowerName =
      name.toLowerCase();

    // MTN
    if (
      lowerName.includes("mtn")
    ) {
      return (
        <div
          className="
            flex h-[58px] w-[58px]
            shrink-0
            items-center justify-center
            rounded-2xl
            bg-[#ffcc00]
            shadow-sm
          "
        >
          <div className="flex flex-col items-center">
            <span
              className="
                text-[13px]
                font-black
                leading-none
                text-[#003b70]
              "
            >
              MTN
            </span>

            <span
              className="
                mt-1
                text-[9px]
                font-extrabold
                leading-none
                text-[#003b70]
              "
            >
              MoMo
            </span>
          </div>
        </div>
      );
    }

    // Airtel
    if (
      lowerName.includes("airtel")
    ) {
      return (
        <div
          className="
            flex h-[58px] w-[58px]
            shrink-0
            items-center justify-center
            rounded-2xl
            bg-red-50
            dark:bg-red-950/30
          "
        >
          <span
            className="
              text-[38px]
              font-black
              italic
              leading-none
              text-red-600
            "
          >
            A
          </span>
        </div>
      );
    }

    // Cards
    if (
      lowerName.includes("visa") ||
      lowerName.includes(
        "mastercard"
      ) ||
      lowerName.includes("card")
    ) {
      return (
        <div
          className="
            flex h-[58px] w-[58px]
            shrink-0
            items-center justify-center
            rounded-2xl
            bg-slate-100
            dark:bg-slate-700
          "
        >
          <CreditCard
            size={29}
            className="
              text-slate-600
              dark:text-slate-200
            "
          />
        </div>
      );
    }

    // Bank
    if (
      lowerName.includes("bank")
    ) {
      return (
        <div
          className="
            flex h-[58px] w-[58px]
            shrink-0
            items-center justify-center
            rounded-2xl
            bg-blue-50
            dark:bg-blue-950
          "
        >
          <Banknote
            size={29}
            className="
              text-blue-700
              dark:text-blue-400
            "
          />
        </div>
      );
    }

    // Default
    return (
      <div
        className="
          flex h-[58px] w-[58px]
          shrink-0
          items-center justify-center
          rounded-2xl
          bg-slate-100
          dark:bg-slate-700
        "
      >
        <CreditCard
          size={28}
          className="
            text-slate-600
            dark:text-slate-200
          "
        />
      </div>
    );
  };

  // ============================================================
  // PAYMENT DESCRIPTION
  // ============================================================

  const getPaymentDescription = (
    name: string
  ) => {
    const lowerName =
      name.toLowerCase();

    if (
      lowerName.includes("mtn")
    ) {
      return "Instant mobile money payment";
    }

    if (
      lowerName.includes("airtel")
    ) {
      return "Fast Airtel Money transfer";
    }

    if (
      lowerName.includes("visa") ||
      lowerName.includes(
        "mastercard"
      ) ||
      lowerName.includes("card")
    ) {
      return "Secure card payment";
    }

    if (
      lowerName.includes("bank")
    ) {
      return "Secure bank transfer";
    }

    if (
      lowerName.includes("mobile")
    ) {
      return "Fast mobile money payment";
    }

    if (
      lowerName.includes("transfer")
    ) {
      return "Fast and secure money transfer";
    }

    return "Secure payment method";
  };

  // ============================================================
  // SORTING
  // ============================================================

  const sortedDeposits =
    [...deposits].sort(
      (a, b) => {
        const valA =
          a[sortField];

        const valB =
          b[sortField];

        if (valA < valB) {
          return sortOrder ===
            "asc"
            ? -1
            : 1;
        }

        if (valA > valB) {
          return sortOrder ===
            "asc"
            ? 1
            : -1;
        }

        return 0;
      }
    );

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages =
    Math.ceil(
      sortedDeposits.length /
        itemsPerPage
    );

  const safeTotalPages =
    Math.max(
      totalPages,
      1
    );

  const currentItems =
    sortedDeposits.slice(
      (currentPage - 1) *
        itemsPerPage,
      currentPage *
        itemsPerPage
    );

  // ============================================================
  // BALANCE
  // ============================================================

  const balance =
    Number(
      wallet?.balance || 0
    );

  // ============================================================
  // MODAL
  // ============================================================

  const depositModal =
    showDeposit &&
    createPortal(
      <div
        className="
          fixed
          inset-0
          z-[999999]
          flex
          items-start
          justify-center
          overflow-y-auto
          bg-slate-950/75
          px-3
          py-4
          backdrop-blur-sm
          sm:px-5
          sm:py-6
          md:py-8
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="deposit-modal-title"
      >
        {/* BACKDROP */}

        <div
          className="
            absolute
            inset-0
          "
          onClick={closeModal}
        />

        {/* MODAL CONTAINER */}

        <div
          ref={modalRef}
          className="
            relative
            z-10
            my-0
            flex
            w-full
            max-w-[1050px]
            flex-col
            overflow-hidden
            rounded-[24px]
            border
            border-slate-200
            bg-white
            shadow-[0_25px_80px_rgba(0,0,0,0.25)]
            dark:border-slate-700
            dark:bg-slate-900
            sm:my-2
            sm:rounded-[28px]
            lg:my-4
            lg:max-h-[calc(100vh-64px)]
            lg:flex-row
          "
        >
          {/* ==================================================
              LEFT SIDE
          ================================================== */}

          <div
            className="
              flex
              min-w-0
              flex-1
              flex-col
              overflow-y-auto
            "
          >
            {/* HEADER */}

            <div
              className="
                relative
                shrink-0
                border-b
                border-slate-100
                px-5
                pb-5
                pt-6
                dark:border-slate-800
                sm:px-8
                sm:pb-6
                sm:pt-7
              "
            >
              {/* CLOSE BUTTON */}

              <button
                type="button"
                onClick={closeModal}
                disabled={depositLoading}
                aria-label="Close"
                className="
                  absolute
                  right-4
                  top-4
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-100
                  text-slate-500
                  transition
                  hover:bg-slate-200
                  hover:text-slate-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:bg-slate-800
                  dark:text-slate-400
                  dark:hover:bg-slate-700
                  dark:hover:text-white
                  sm:right-6
                  sm:top-6
                "
              >
                <X size={18} />
              </button>

              {/* TITLE */}

              <div
                className="
                  flex
                  items-center
                  gap-4
                  pr-10
                "
              >
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-50
                    dark:bg-blue-950
                  "
                >
                  <Wallet
                    size={25}
                    className="
                      text-blue-700
                      dark:text-blue-400
                    "
                  />
                </div>

                <div>
                  <h2
                    id="deposit-modal-title"
                    className="
                      text-xl
                      font-extrabold
                      tracking-tight
                      text-slate-950
                      dark:text-white
                      sm:text-2xl
                    "
                  >
                    Add money
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    Add funds securely to your wallet
                  </p>
                </div>
              </div>
            </div>

            {/* MAIN FORM */}

            <div
              className="
                px-5
                py-6
                sm:px-8
                sm:py-7
              "
            >
              {/* PAYMENT METHOD */}

              <div className="mb-7">
                <div className="mb-4">
                  <h3
                    className="
                      text-lg
                      font-extrabold
                      text-slate-950
                      dark:text-white
                    "
                  >
                    Payment method
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    Select how you want to add money.
                  </p>
                </div>

                <div className="space-y-3">
                  {paymentMethods.length >
                  0 ? (
                    paymentMethods.map(
                      (pm) => {
                        const selected =
                          paymentMethodId ===
                          pm.id.toString();

                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() =>
                              setPaymentMethodId(
                                pm.id.toString()
                              )
                            }
                            className={`
                              flex
                              w-full
                              items-center
                              gap-4
                              rounded-2xl
                              border
                              p-3
                              text-left
                              transition-all
                              duration-200
                              sm:p-4
                              ${
                                selected
                                  ? `
                                    border-blue-500
                                    bg-blue-50
                                    shadow-sm
                                    dark:border-blue-500
                                    dark:bg-blue-950/30
                                  `
                                  : `
                                    border-slate-200
                                    bg-white
                                    hover:border-blue-300
                                    hover:bg-slate-50
                                    dark:border-slate-700
                                    dark:bg-slate-900
                                    dark:hover:border-slate-600
                                    dark:hover:bg-slate-800
                                  `
                              }
                            `}
                          >
                            {getPaymentIcon(
                              pm.name
                            )}

                            <div
                              className="
                                min-w-0
                                flex-1
                              "
                            >
                              <p
                                className="
                                  text-base
                                  font-extrabold
                                  text-slate-950
                                  dark:text-white
                                  sm:text-lg
                                "
                              >
                                {pm.name}
                              </p>

                              <p
                                className="
                                  mt-1
                                  text-sm
                                  text-slate-500
                                  dark:text-slate-400
                                "
                              >
                                {getPaymentDescription(
                                  pm.name
                                )}
                              </p>
                            </div>

                            <div
                              className={`
                                flex
                                h-7
                                w-7
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border-2
                                transition
                                ${
                                  selected
                                    ? `
                                      border-blue-600
                                      bg-blue-600
                                      text-white
                                    `
                                    : `
                                      border-slate-300
                                      bg-transparent
                                      text-transparent
                                      dark:border-slate-600
                                    `
                                }
                              `}
                            >
                              <Check
                                size={15}
                                strokeWidth={3}
                              />
                            </div>
                          </button>
                        );
                      }
                    )
                  ) : (
                    <div
                      className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-5
                        py-8
                        text-center
                        text-sm
                        text-slate-400
                        dark:border-slate-700
                        dark:bg-slate-800
                      "
                    >
                      Loading payment methods...
                    </div>
                  )}
                </div>
              </div>

              {/* PAYMENT DETAILS */}

              <div>
                <h3
                  className="
                    mb-4
                    text-lg
                    font-extrabold
                    text-slate-950
                    dark:text-white
                  "
                >
                  Payment details
                </h3>

                {/* CURRENCY */}

                <div className="mb-5">
                  <label
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Currency
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrencyOpen(
                          !currencyOpen
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        px-4
                        py-3.5
                        text-left
                        outline-none
                        transition
                        hover:border-blue-500
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-500/20
                        dark:border-slate-700
                        dark:bg-slate-800
                      "
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-100
                            dark:bg-slate-700
                          "
                        >
                          <span
                            className="
                              text-sm
                              font-bold
                              text-slate-600
                              dark:text-slate-300
                            "
                          >
                            $
                          </span>
                        </div>

                        <span
                          className={
                            currencyId
                              ? `
                                text-sm
                                font-semibold
                                text-slate-900
                                dark:text-white
                              `
                              : `
                                text-sm
                                text-slate-400
                              `
                          }
                        >
                          {selectedCurrency?.currency_name ||
                            "Select currency"}
                        </span>
                      </div>

                      <ChevronDown
                        size={18}
                        className={`
                          text-slate-400
                          transition-transform
                          ${
                            currencyOpen
                              ? "rotate-180"
                              : ""
                          }
                        `}
                      />
                    </button>

                    {currencyOpen && (
                      <ul
                        className="
                          absolute
                          left-0
                          right-0
                          z-[1000000]
                          mt-2
                          max-h-56
                          overflow-y-auto
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          p-1
                          shadow-2xl
                          dark:border-slate-700
                          dark:bg-slate-800
                        "
                      >
                        {currencies.length >
                        0 ? (
                          currencies.map(
                            (currency) => (
                              <li
                                key={
                                  currency.currency_id
                                }
                                onClick={() => {
                                  setCurrencyId(
                                    currency.currency_id.toString()
                                  );

                                  setCurrencyOpen(
                                    false
                                  );
                                }}
                                className="
                                  cursor-pointer
                                  rounded-lg
                                  px-4
                                  py-3
                                  text-sm
                                  font-semibold
                                  text-slate-700
                                  transition
                                  hover:bg-slate-100
                                  dark:text-slate-200
                                  dark:hover:bg-slate-700
                                "
                              >
                                {
                                  currency.currency_name
                                }
                              </li>
                            )
                          )
                        ) : (
                          <li
                            className="
                              px-4
                              py-4
                              text-center
                              text-sm
                              text-slate-400
                            "
                          >
                            No currencies available
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                {/* PHONE */}

                <div className="mb-5">
                  <label
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Phone number
                  </label>

                  <div className="relative">
                    <Smartphone
                      size={19}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value
                        )
                      }
                      placeholder="Enter phone number"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        py-3.5
                        pl-12
                        pr-4
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        hover:border-blue-500
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-500/20
                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-white
                      "
                    />
                  </div>
                </div>

                {/* AMOUNT */}

                <div className="mb-6">
                  <label
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Amount
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={amount}
                      onChange={(e) =>
                        setAmount(
                          e.target.value
                        )
                      }
                      placeholder="Enter amount"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        px-4
                        py-4
                        pr-24
                        text-lg
                        font-bold
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        hover:border-blue-500
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-500/20
                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-white
                      "
                    />

                    <span
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        rounded-lg
                        bg-slate-100
                        px-2.5
                        py-1.5
                        text-xs
                        font-bold
                        text-slate-600
                        dark:bg-slate-700
                        dark:text-slate-300
                      "
                    >
                      {selectedCurrency?.currency_name ||
                        "RWF"}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECURITY */}

              <div
                className="
                  mb-6
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-100
                  bg-slate-50
                  px-3
                  py-3
                  dark:border-slate-800
                  dark:bg-slate-800/60
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                  "
                >
                  <ShieldCheck
                    size={30}
                    className="text-blue-600"
                  />
                </div>

                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >
                  <p
                    className="
                      text-xs
                      font-bold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Secure payment
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      text-slate-400
                    "
                  >
                    Your payment information is securely
                    processed.
                  </p>
                </div>

                <LockKeyhole
                  size={16}
                  className="text-slate-400"
                />
              </div>

              {/* ACTION BUTTONS */}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={depositLoading}
                  className="
                    flex-1
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-4
                    py-3.5
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:bg-slate-50
                    disabled:opacity-50
                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-slate-200
                    dark:hover:bg-slate-700
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeposit}
                  disabled={depositLoading}
                  className="
                    flex-1
                    rounded-xl
                    bg-blue-900
                    px-4
                    py-3.5
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-blue-900/20
                    transition
                    hover:bg-blue-800
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {depositLoading
                    ? "Processing…"
                    : "Continue to deposit"}
                </button>
              </div>
            </div>
          </div>

          {/* ==================================================
              RIGHT INFORMATION PANEL
          ================================================== */}

          <div
            className="
              hidden
              w-[320px]
              shrink-0
              flex-col
              justify-between
              border-l
              border-slate-200
              bg-slate-50
              dark:border-slate-700
              dark:bg-slate-800/50
              lg:flex
            "
          >
            <div className="p-7">
              {/* WALLET ILLUSTRATION */}

              <div className="flex justify-center pt-5">
                <div
                  className="
                    relative
                    flex
                    h-28
                    w-28
                    items-center
                    justify-center
                  "
                >
                  <div
                    className="
                      flex
                      h-20
                      w-20
                      items-center
                      justify-center
                      rounded-3xl
                      bg-blue-900
                      shadow-xl
                    "
                  >
                    <Wallet
                      size={37}
                      className="text-white"
                    />
                  </div>

                  <div
                    className="
                      absolute
                      bottom-1
                      right-1
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border-4
                      border-slate-50
                      bg-green-500
                      text-white
                      dark:border-slate-800
                    "
                  >
                    <Check
                      size={17}
                      strokeWidth={3}
                    />
                  </div>
                </div>
              </div>

              {/* TITLE */}

              <h3
                className="
                  mt-7
                  text-center
                  text-xl
                  font-extrabold
                  tracking-tight
                  text-slate-950
                  dark:text-white
                "
              >
                Safe & secure payment
              </h3>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-[260px]
                  text-center
                  text-sm
                  leading-6
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Choose your preferred payment method
                and securely add funds to your wallet.
              </p>

              {/* CURRENT BALANCE */}

              <div
                className="
                  mt-7
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  dark:border-slate-700
                  dark:bg-slate-800
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                    "
                  >
                    <Wallet
                      size={30}
                      className="
                        text-blue-700
                        dark:text-blue-400
                      "
                    />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="
                        text-xs
                        text-slate-400
                      "
                    >
                      Current balance
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-base
                        font-extrabold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      {balance.toLocaleString()} RWF
                    </p>
                  </div>
                </div>
              </div>

              {/* SELECTED PAYMENT */}

              {selectedPaymentMethod && (
                <div
                  className="
                    mt-4
                    rounded-2xl
                    border
                    border-blue-100
                    bg-blue-50/70
                    p-4
                    dark:border-blue-900
                    dark:bg-blue-950/30
                  "
                >
                  <p
                    className="
                      mb-3
                      text-[10px]
                      font-extrabold
                      uppercase
                      tracking-widest
                      text-blue-700
                      dark:text-blue-400
                    "
                  >
                    Selected method
                  </p>

                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        dark:bg-slate-800
                      "
                    >
                      <Check
                        size={18}
                        className="text-green-600"
                        strokeWidth={3}
                      />
                    </div>

                    <span
                      className="
                        text-sm
                        font-extrabold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      {
                        selectedPaymentMethod.name
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* INFORMATION */}

              <div
                className="
                  mt-5
                  space-y-3
                "
              >
                <div className="flex items-start gap-3">
                  <Check
                    size={17}
                    className="
                      mt-0.5
                      shrink-0
                      text-green-600
                    "
                    strokeWidth={3}
                  />

                  <p
                    className="
                      text-xs
                      leading-5
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    Your wallet balance will be updated
                    after the deposit is processed.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Check
                    size={17}
                    className="
                      mt-0.5
                      shrink-0
                      text-green-600
                    "
                    strokeWidth={3}
                  />

                  <p
                    className="
                      text-xs
                      leading-5
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    Select the payment method you
                    normally use.
                  </p>
                </div>
              </div>
            </div>

            {/* SECURITY FOOTER */}

            <div
              className="
                border-t
                border-slate-200
                p-6
                dark:border-slate-700
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  bg-white
                  px-3
                  py-3
                  shadow-sm
                  dark:bg-slate-800
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-green-50
                    dark:bg-green-950
                  "
                >
                  <LockKeyhole
                    size={17}
                    className="text-green-600"
                  />
                </div>

                <div>
                  <p
                    className="
                      text-xs
                      font-bold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Protected transaction
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      text-slate-400
                    "
                  >
                    Your details remain secure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
          }}
        />

        <div className="p-6">
          Loading dashboard…
        </div>
      </>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />

      <div className="p-6">
        {/* PAGE TITLE */}

        <h1
          className="
            mb-6
            text-2xl
            font-bold
            text-slate-900
            dark:text-white
          "
        >
          Dashboard
        </h1>

        {/* ======================================================
            WALLET
        ====================================================== */}

        <div
          className="
            mb-6
            rounded-2xl
            bg-white
            p-4
            shadow
            dark:bg-gray-800
          "
        >
          <h3
            className="
              mb-3
              font-semibold
              text-slate-900
              dark:text-white
            "
          >
            Wallet
          </h3>

          <div
            className="
              mb-6
              grid
              grid-cols-1
              gap-4
              md:grid-cols-4
            "
          >
            {/* AVAILABLE BALANCE */}

            <div
              className="
                rounded-2xl
                bg-slate-50
                p-4
                shadow-sm
                dark:bg-gray-700
              "
            >
              <p
                className="
                  text-sm
                  text-gray-400
                "
              >
                Available Balance
              </p>

              <div
                className="
                  mt-1
                  flex
                  items-baseline
                  gap-2
                "
              >
                <span
                  className="
                    text-2xl
                    font-bold
                    text-blue-600
                  "
                >
                  {balance.toLocaleString()}
                </span>

                <span
                  className="
                    text-sm
                    font-semibold
                    text-slate-500
                    dark:text-slate-300
                  "
                >
                  RWF
                </span>
              </div>
            </div>
          </div>

          {/* DEPOSIT BUTTON */}

          <button
            type="button"
            onClick={openDeposit}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-blue-900
              px-5
              py-3
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-blue-900/20
              transition
              hover:bg-blue-800
              active:scale-[0.98]
            "
          >
            <Plus size={18} />
            Deposit
          </button>
        </div>

        {/* ======================================================
            DEPOSIT HISTORY
        ====================================================== */}

        {deposits.length > 0 && (
          <div
            className="
              rounded-2xl
              bg-white
              p-4
              shadow
              dark:bg-gray-900
            "
          >
            <h3
              className="
                mb-4
                font-semibold
                text-slate-900
                dark:text-white
              "
            >
              Deposit History
            </h3>

            <div className="overflow-x-auto">
              <table
                className="
                  w-full
                  border-collapse
                  text-left
                "
              >
                <thead>
                  <tr>
                    {[
                      {
                        label: "Date",
                        key: "date",
                      },
                      {
                        label: "Amount",
                        key: "amount",
                      },
                      {
                        label: "Currency",
                        key: "currency",
                      },
                      {
                        label: "Payment Method",
                        key: "payment_method",
                      },
                      {
                        label: "Phone",
                        key: "phone",
                      },
                      {
                        label: "Status",
                        key: "status",
                      },
                    ].map((column) => (
                      <th
                        key={column.key}
                        onClick={() => {
                          if (
                            sortField ===
                            column.key
                          ) {
                            setSortOrder(
                              sortOrder ===
                                "asc"
                                ? "desc"
                                : "asc"
                            );
                          } else {
                            setSortField(
                              column.key as keyof DepositRecord
                            );

                            setSortOrder(
                              "asc"
                            );
                          }
                        }}
                        className="
                          cursor-pointer
                          border-b
                          border-slate-200
                          p-3
                          text-sm
                          font-semibold
                          text-slate-600
                          dark:border-slate-700
                          dark:text-slate-300
                        "
                      >
                        {column.label}{" "}
                        {sortField ===
                        column.key
                          ? sortOrder ===
                            "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {currentItems.map(
                    (deposit) => (
                      <tr
                        key={
                          deposit.id
                        }
                        className="
                          transition
                          hover:bg-slate-50
                          dark:hover:bg-slate-800
                        "
                      >
                        <td
                          className="
                            border-b
                            border-slate-100
                            p-3
                            text-sm
                            dark:border-slate-800
                          "
                        >
                          {
                            deposit.date
                          }
                        </td>

                        <td
                          className="
                            border-b
                            border-slate-100
                            p-3
                            text-sm
                            font-semibold
                            dark:border-slate-800
                          "
                        >
                          {
                            deposit.amount
                          }
                        </td>

                        <td
                          className="
                            border-b
                            border-slate-100
                            p-3
                            text-sm
                            dark:border-slate-800
                          "
                        >
                          {
                            deposit.currency
                          }
                        </td>

                        <td
                          className="
                            border-b
                            border-slate-100
                            p-3
                            text-sm
                            dark:border-slate-800
                          "
                        >
                          {
                            deposit.payment_method
                          }
                        </td>

                        <td
                          className="
                            border-b
                            border-slate-100
                            p-3
                            text-sm
                            dark:border-slate-800
                          "
                        >
                          {
                            deposit.phone
                          }
                        </td>

                        <td
                          className="
                            border-b
                            border-slate-100
                            p-3
                            text-sm
                            dark:border-slate-800
                          "
                        >
                          <span
                            className="
                              rounded-full
                              bg-slate-100
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              dark:bg-slate-800
                            "
                          >
                            {
                              deposit.status
                            }
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            <div
              className="
                mt-4
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <button
                type="button"
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                disabled={
                  currentPage === 1
                }
                className="
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  py-1.5
                  text-sm
                  font-medium
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:border-slate-700
                "
              >
                Prev
              </button>

              <span
                className="
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Page{" "}
                {currentPage} /{" "}
                {safeTotalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        safeTotalPages,
                        page + 1
                      )
                  )
                }
                disabled={
                  currentPage >=
                  safeTotalPages
                }
                className="
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  py-1.5
                  text-sm
                  font-medium
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:border-slate-700
                "
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
            PORTAL MODAL
        ====================================================== */}

        {depositModal}
      </div>
    </>
  );
}