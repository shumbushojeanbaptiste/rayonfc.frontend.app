import React, { useRef, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  HiHome,
  HiCollection,
  HiChartBar,
  HiChat,
  HiUpload,
  HiCog,
  HiCash,
  HiRefresh,
  HiArrowDown,
  HiCreditCard,
} from "react-icons/hi";

import { PiHandDeposit, PiHandWithdraw } from "react-icons/pi";

type SsidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const MENU = [
  {
    title: "",
    items: [
      { to: "/finance", label: "Dashboard", icon: <HiHome /> },
      { to: "/finance/deposits", label: "Deposits", icon: <PiHandDeposit /> },
     // { to: "/finance/transfer", label: "Internal transfer", icon: <HiRefresh /> },
      { to: "/finance/withdrawals", label: "Withdrawals", icon: <PiHandWithdraw /> },
     // { to: "/finance/payments", label: "Payments", icon: <HiCreditCard /> },
    ],
  },
  {
    title: "",
    items: [
      //{ to: "/studio/settings", label: "Settings", icon: <HiCog /> }
    ],
  },
];

export default function Fsidebar({
  sidebarOpen,
  setSidebarOpen,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}: SsidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ✅ Force collapsed sidebar as default
  useEffect(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  // Detect mobile resizing
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node) &&
        mobileSidebarOpen
      ) {
        setMobileSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileSidebarOpen, setMobileSidebarOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          hidden md:flex flex-col
          bg-white dark:bg-gray-800
          border-r dark:border-gray-700
          dark:text-slate-400
          transition-[width] duration-300
          ${sidebarOpen ? "w-64" : "w-20"}
          h-screen
          group
        `}
      >
        <nav
          className={`
            flex-1 px-3 pt-4 flex flex-col
            transition-all duration-200 ease-out
            ${
              sidebarOpen
                ? "overflow-y-hidden pb-24 group-hover:overflow-y-auto group-hover:scrollbar-thin group-hover:scrollbar-thumb-neutral-400 dark:group-hover:scrollbar-thumb-neutral-600"
                : "overflow-y-auto pb-24 no-scrollbar"
            }
          `}
          style={{ scrollPaddingBottom: "6rem" }}
        >
          {MENU.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-1">
              {section.title && sidebarOpen && (
                <div className="mt-2 px-4 text-xs font-semibold uppercase text-gray-500">
                  {section.title}
                </div>
              )}

              {section.items.map((item, idx) => (
                <NavLink
                  key={`${item.to}-${idx}`}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `
                      flex ${
                        sidebarOpen
                          ? "flex-row gap-3"
                          : "flex-col gap-1 justify-center items-center w-full"
                      }
                      px-4 py-3 rounded-lg text-sm font-medium text-center
                      ${
                        isActive
                          ? "bg-gray-100 dark:bg-gray-700"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }
                    `
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className={`${sidebarOpen ? "" : "text-xs"}`}>
                    {item.label}
                  </span>
                </NavLink>
              ))}

              {sectionIndex < MENU.length - 1 && (
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed top-16 left-0 right-0 bottom-0 z-40 flex md:hidden
          transition-opacity duration-300
          ${mobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-30"
          onClick={() => setMobileSidebarOpen(false)}
        />

        <aside
          ref={sidebarRef}
          className={`
            relative w-64 h-[calc(100vh-4rem)] flex flex-col
            bg-white dark:bg-gray-800 border-r dark:border-gray-700
            transform transition-transform duration-300 ease-out
            ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <nav
            className="flex-1 px-3 py-4 flex flex-col space-y-1 overflow-y-auto scroll-smooth
                       scrollbar-thin scrollbar-thumb-neutral-400 dark:scrollbar-thumb-neutral-600"
            style={{ scrollPaddingBottom: "6rem" }}
          >
            {MENU.map((section, sectionIndex) => (
              <div key={`mobile-section-${sectionIndex}`} className="mb-3">
                {section.title && (
                  <div className="mt-2 px-4 text-xs font-semibold uppercase text-gray-500">
                    {section.title}
                  </div>
                )}

                {section.items.map((item, idx) => (
                  <NavLink
                    key={`${item.to}-mobile-${idx}`}
                    to={item.to}
                    end
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      `
                        flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                        ${
                          isActive
                            ? "bg-gray-100 dark:bg-gray-700"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }
                      `
                    }
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}

                {sectionIndex < MENU.length - 1 && (
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                )}
              </div>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
