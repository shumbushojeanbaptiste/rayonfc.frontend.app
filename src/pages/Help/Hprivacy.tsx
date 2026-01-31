import React, { useState } from "react";

/* -----------------------------
   Accordion Item (local)
----------------------------- */
function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
   Privacy Help Page
----------------------------- */
export default function PrivacyHelp() {
  // Replace with real role from auth later
  const [role, setRole] = useState<"user" | "admin">("user");

  return (
    <div className="space-y-6 max-w-5xl">
      {/* PAGE HEADER */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold dark:text-slate-200">
              Privacy & Data Protection
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Understand how your data is collected, used, and protected.
            </p>
          </div>

          {/* ROLE SWITCH */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "user" | "admin")}
            className="border px-3 py-2 rounded dark:bg-black dark:text-slate-300"
          >
            <option value="user">User View</option>
            <option value="admin">Admin View</option>
          </select>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="bg-white dark:bg-black p-6 rounded shadow-8">
        <h2 className="text-lg font-semibold mb-4 dark:text-slate-300">
          Privacy FAQs
        </h2>

        <AccordionItem title="What personal data do you collect?">
          We collect information such as your name, email address, phone number,
          login activity, and usage data to provide and secure our services.
        </AccordionItem>

        <AccordionItem title="How is my data used?">
          Your data is used to operate the platform, improve services, ensure
          security, and comply with legal requirements.
        </AccordionItem>

        <AccordionItem title="Is my data shared with third parties?">
          We only share data with trusted service providers when necessary and
          never sell your personal information.
        </AccordionItem>

        <AccordionItem title="How do you protect my data?">
          We use encryption, access controls, monitoring, and regular security
          reviews to safeguard your information.
        </AccordionItem>

        <AccordionItem title="Can I access or delete my data?">
          You may request access, correction, or deletion of your personal data
          through your account settings or by contacting support.
        </AccordionItem>

        {/* ROLE-BASED CONTENT */}
        {role === "admin" && (
          <AccordionItem title="Admin Data Responsibilities">
            Admins are responsible for ensuring user data is handled according
            to privacy policies, access controls are enforced, and audit logs are
            reviewed regularly.
          </AccordionItem>
        )}

        {role === "user" && (
          <AccordionItem title="Your Privacy Controls">
            Users can manage privacy preferences, update personal information,
            and review account activity from their account settings.
          </AccordionItem>
        )}

        <AccordionItem title="Data retention policy">
          We retain personal data only as long as necessary for operational,
          legal, and security purposes.
        </AccordionItem>
      </div>
    </div>
  );
}
