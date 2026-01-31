import React from "react";

export default function FinanceHelp() {
  return (
    <div className="space-y-8 max-w-6xl">
      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 text-white p-8 rounded-lg shadow-8">
        <h1 className="text-3xl font-bold">Finance & Payments</h1>
        <p className="mt-2 text-green-100 max-w-2xl">
          Understand how your wallet works, how to move money in and out, and
          how we protect your transactions.
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-black p-5 rounded shadow-8">
          <h3 className="font-semibold dark:text-slate-300">View Wallet</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Check your available balance and recent activity.
          </p>
          <button className="mt-3 text-green-600 font-medium">
            Go to Wallet →
          </button>
        </div>

        <div className="bg-white dark:bg-black p-5 rounded shadow-8">
          <h3 className="font-semibold dark:text-slate-300">Make a Deposit</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Add funds using supported payment methods.
          </p>
          <button className="mt-3 text-green-600 font-medium">
            Deposit Funds →
          </button>
        </div>

        <div className="bg-white dark:bg-black p-5 rounded shadow-8">
          <h3 className="font-semibold dark:text-slate-300">Withdraw Money</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Request a withdrawal to your linked account.
          </p>
          <button className="mt-3 text-green-600 font-medium">
            Withdraw →
          </button>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8">
        <h2 className="text-xl font-semibold dark:text-slate-300 mb-4">
          How Payments Work
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="border-l-4 border-green-600 pl-4">
            <h4 className="font-medium dark:text-slate-300">1. Deposit</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Funds are added to your wallet using secure payment providers.
            </p>
          </div>

          <div className="border-l-4 border-green-600 pl-4">
            <h4 className="font-medium dark:text-slate-300">2. Use Funds</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Wallet balance can be used for services or stored securely.
            </p>
          </div>

          <div className="border-l-4 border-green-600 pl-4">
            <h4 className="font-medium dark:text-slate-300">3. Withdraw</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Withdrawals are processed after verification checks.
            </p>
          </div>
        </div>
      </div>

      {/* SECURITY NOTICE */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">
          Transaction Security
        </h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
          All transactions are encrypted and monitored for fraud. Suspicious
          activity may trigger temporary holds for your protection.
        </p>
      </div>

      {/* ADMIN SECTION */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8">
        <h2 className="text-xl font-semibold dark:text-slate-300 mb-2">
          Admin Finance Controls
        </h2>
        <p className="text-gray-600 dark:text-slate-400 max-w-2xl">
          Administrators can review transactions, manage payment providers,
          approve withdrawals, and generate financial reports.
        </p>
      </div>
    </div>
  );
}
