import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import PublicHeader from '../components/Publicinfo/PublicHeader';
import Sidebartwo from '../components/Sidebar/indextwo';

export default function DefaultLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);  // <-- set default collapsed here

  return (
    <div className="h-screen flex flex-col dark:bg-boxdark-2 dark:text-bodydark">
      {/* HEADER */}
      <PublicHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        expanded={expanded}
        setExpanded={setExpanded}
      />

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebartwo
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          expanded={expanded}
        />

        {/* MAIN CONTENT SCROLLS */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 2xl:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
