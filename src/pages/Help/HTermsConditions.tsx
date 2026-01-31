import React from "react";

export default function TermsConditionsHelp() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* PAGE HEADER */}
      <div className="bg-gray-800 dark:bg-gray-900 text-white p-8 rounded-lg shadow-8">
        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
        <p className="mt-2 text-gray-300 max-w-3xl">
          Please read these Terms and Conditions carefully before using our
          platform. They govern your access, rights, and responsibilities.
        </p>
      </div>

      {/* INTRODUCTION */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8">
        <p className="text-gray-600 dark:text-slate-400">
          By accessing or using the services, you agree to be bound by these
          terms. If you do not agree, please do not use the platform.
        </p>
      </div>

      {/* CLAUSE SECTIONS */}
      <div className="space-y-6">
        {/* Clause 1 */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded shadow-8 border-l-4 border-indigo-600">
          <h3 className="font-semibold dark:text-slate-200">1. Account Responsibilities</h3>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Users are responsible for maintaining confidentiality of account
            credentials and all activities under their account.
          </p>
        </div>

        {/* Clause 2 */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded shadow-8 border-l-4 border-indigo-600">
          <h3 className="font-semibold dark:text-slate-200">2. Acceptable Use</h3>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            You agree not to misuse the services, upload harmful content, or
            violate any laws or regulations.
          </p>
        </div>

        {/* Clause 3 */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded shadow-8 border-l-4 border-indigo-600">
          <h3 className="font-semibold dark:text-slate-200">3. Payment Terms</h3>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            All payments are processed according to the platform’s policies.
            Users are responsible for any fees associated with transactions.
          </p>
        </div>

        {/* Clause 4 */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded shadow-8 border-l-4 border-indigo-600">
          <h3 className="font-semibold dark:text-slate-200">4. Liability</h3>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            The platform is not liable for indirect damages. Users accept all
            risks associated with using the service.
          </p>
        </div>

        {/* ADMIN NOTICE */}
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">
            Admin Clause
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Administrators may enforce terms, suspend accounts, or remove content
            violating policies.
          </p>
        </div>

        {/* FINAL REMINDER */}
        <div className="p-6 bg-gray-100 dark:bg-gray-900 rounded shadow-8 text-gray-700 dark:text-slate-400">
          <strong>Note:</strong> Users should periodically review these terms as
          updates may occur without prior notice.
        </div>
      </div>
    </div>
  );
}
