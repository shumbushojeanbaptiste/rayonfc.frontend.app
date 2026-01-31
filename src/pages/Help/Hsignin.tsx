import React from "react";

export default function Hsignin() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* PAGE HEADER */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8">
        <h1 className="text-2xl font-bold dark:text-slate-200">
          Sign-In Recovery & Security
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mt-2">
          Learn how to recover access to your account and keep it secure if you
          forget your credentials or notice suspicious activity.
        </p>
      </div>

      {/* RECOVERY OVERVIEW */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8">
        <h2 className="text-lg font-semibold dark:text-slate-300 mb-2">
          Account Recovery Overview
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          Sign-in recovery helps you regain access to your account if you forget
          your password, lose access to your email or phone, or your account is
          temporarily locked for security reasons.
        </p>
      </div>

      {/* PASSWORD RESET */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8">
        <h2 className="text-lg font-semibold dark:text-slate-300 mb-2">
          Resetting Your Password
        </h2>
        <ul className="list-disc ml-5 text-gray-600 dark:text-slate-400 space-y-1">
          <li>Go to the sign-in page and click <strong>“Forgot Password”</strong>.</li>
          <li>Enter the email address linked to your account.</li>
          <li>Check your inbox for a password reset link.</li>
          <li>Create a strong, unique password you haven’t used before.</li>
        </ul>
      </div>

      {/* 2FA RECOVERY */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8">
        <h2 className="text-lg font-semibold dark:text-slate-300 mb-2">
          Two-Factor Authentication (2FA) Recovery
        </h2>
        <p className="text-gray-600 dark:text-slate-400 mb-2">
          If you lose access to your authentication device:
        </p>
        <ul className="list-disc ml-5 text-gray-600 dark:text-slate-400 space-y-1">
          <li>Use your saved recovery codes if available.</li>
          <li>Verify your identity through email or SMS.</li>
          <li>Contact support if automated recovery fails.</li>
        </ul>
      </div>

      {/* EMAIL & PHONE */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8">
        <h2 className="text-lg font-semibold dark:text-slate-300 mb-2">
          Lost Access to Email or Phone
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          If you no longer have access to your registered email or phone number,
          you may be required to complete additional identity verification to
          protect your account from unauthorized access.
        </p>
      </div>

      {/* SUSPICIOUS ACTIVITY */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8 border border-red-200 dark:border-red-900">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
          Suspicious Sign-In Activity
        </h2>
        <ul className="list-disc ml-5 text-gray-600 dark:text-slate-400 space-y-1">
          <li>Immediately reset your password.</li>
          <li>Enable or re-enable two-factor authentication.</li>
          <li>Review recent login activity.</li>
          <li>Contact support if you notice unfamiliar activity.</li>
        </ul>
      </div>

      {/* SECURITY TIPS */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8">
        <h2 className="text-lg font-semibold dark:text-slate-300 mb-2">
          Security Best Practices
        </h2>
        <ul className="list-disc ml-5 text-gray-600 dark:text-slate-400 space-y-1">
          <li>Use a strong, unique password.</li>
          <li>Never share your login details.</li>
          <li>Enable two-factor authentication.</li>
          <li>Keep your recovery email and phone number up to date.</li>
        </ul>
      </div>

      {/* SUPPORT */}
      <div className="bg-slate-50 dark:bg-black p-6 rounded shadow-8">
        <h2 className="text-lg font-semibold dark:text-slate-300 mb-2">
          Need More Help?
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          If you’re unable to recover your account using the steps above, please
          contact our support team for further assistance.
        </p>
      </div>
    </div>
  );
}
