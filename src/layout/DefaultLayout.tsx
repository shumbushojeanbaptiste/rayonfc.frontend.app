import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function DefaultLayout() {
  // Mobile sidebar open/close
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Desktop sidebar expanded/collapsed
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden dark:bg-boxdark-2 dark:text-bodydark">
      
      {/* HEADER */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        expanded={expanded}
        setExpanded={setExpanded}
      />

      {/* MAIN AREA: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          expanded={expanded}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto ">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
