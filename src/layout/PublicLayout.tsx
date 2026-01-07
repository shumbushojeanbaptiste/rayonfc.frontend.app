import { Outlet } from "react-router-dom";

import { useState } from "react";
import PublicHeader from "../components/Publicinfo/PublicHeader";
import Sidebartwo from "../components/Sidebar/indextwo";

export default function PublicLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden dark:bg-boxdark-2 dark:text-bodydark">
      <Sidebartwo sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* MAIN SCROLL CONTAINER */}
      <div
        id="app-scroll-container"
        className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
      >
        <PublicHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 md:p-6 2xl:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
