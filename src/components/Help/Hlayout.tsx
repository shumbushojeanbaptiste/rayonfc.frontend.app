import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Htopbar from "./Htopbar";
import Hsidebar from "./Hsidar";



export default function Hlayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // desktop collapsed/expanded
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // mobile overlay
  const [expanded, setExpanded] = useState(true); // header hamburger toggle (optional)

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      
      {/* Header / Topbar */}
      <Htopbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        expanded={expanded}
        setExpanded={setExpanded}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Hsidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
