import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Ssidebar from "./Ssidar";
import Stopbar from "./Stopbar";
import Header from "../Header";

type SlayoutProps = {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
};



export default function Slayout({ dark, setDark }: SlayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Ssidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}  />
      <div className="flex-1 flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        <Stopbar dark={dark} setDark={setDark} />
        <main className="p-6 overflow-auto">
          <Outlet />
          
        </main>
      </div>
    </div>
  );
}
