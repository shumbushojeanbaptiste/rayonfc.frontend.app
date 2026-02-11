import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/* -----------------------------
   Accordion Item (local)
----------------------------- */
function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) 

{
  
  const [open, setOpen] = useState(false);
 
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex justify-between items-center dark:text-slate-300"
      >
        <span className="font-medium">{title}</span>
        <span className="text-lg">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="p-4 pt-0 text-gray-600 dark:text-slate-400">
          {children}
        </div>
      )}
    </div>
  );
}

/* -----------------------------
   Page Component
----------------------------- */
export default function Managment() {
  // Replace later with real user role from auth
  const [role, setRole] = useState<"user" | "admin">("user");
  const navigate = useNavigate();


  return (
    <div className="space-y-6 max-w-5xl">
      {/* PAGE HEADER */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold dark:text-slate-200">
              Manage Your Account
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Update your profile, manage security settings, and control account
              preferences.
            </p>
          </div>

          {/* ROLE SELECT (temporary UI) */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "user" | "admin")}
            className="border px-3 py-2 rounded dark:bg-black dark:text-slate-300"
          >
            <option value="user">User View</option>
            <option value="admin">Admin View</option>
          </select>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-5">
           <button
              onClick={() => navigate("/settings")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
            >
            Update Profile
           </button>

          <button
           onClick={() => navigate("/change-password")}
           className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded">
            Change Password
          </button>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8">
        <h2 className="text-lg font-semibold mb-4 dark:text-slate-300">
          Frequently Asked Questions
        </h2>

        <AccordionItem title="How do I update my profile information?">
          You can update your name, email address, and phone number from your
          account profile settings. Make sure your information is always current.
        </AccordionItem>

        <AccordionItem title="How do I change my password?">
          Navigate to security settings and select “Change Password”. Choose a
          strong password that you don’t use elsewhere.
        </AccordionItem>

        <AccordionItem title="How do I manage notifications?">
          You can control email notifications, security alerts, and product
          updates from your notification preferences.
        </AccordionItem>

        {/* ROLE-BASED CONTENT */}
        {role === "admin" && (
          <AccordionItem title="Admin Account Management">
            Admins can manage user access, reset user passwords, review activity
            logs, and enforce platform security policies.
          </AccordionItem>
        )}

        {role === "user" && (
          <AccordionItem title="User Account Permissions">
            Standard users can manage their personal settings but cannot access
            administrative or system-level controls.
          </AccordionItem>
        )}

        <AccordionItem title="How do I deactivate my account?">
          You can request account deactivation from account settings. Some data
          may be retained for security and legal compliance.
        </AccordionItem>
      </div>
    </div>
  );
}
