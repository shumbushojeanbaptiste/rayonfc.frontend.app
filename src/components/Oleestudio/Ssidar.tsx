
import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { HiHome, HiCollection, HiChartBar, HiChat, HiUpload, HiCog } from "react-icons/hi";

const items = [
  {to: "studio", label: "Dashboard", icon: <HiHome />},
  {to: "studio/content", label: "Content", icon: <HiCollection />},
  {to: "studio/analytics", label: "Analytics", icon: <HiChartBar />},
  {to: "studio/comments", label: "Comments", icon: <HiChat />},
  {to: "studio/upload", label: "Upload", icon: <HiUpload />},
  {to: "studio/settings", label: "Settings", icon: <HiCog />},
];

type SsidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Ssidebar( { sidebarOpen, setSidebarOpen }: SsidebarProps ){ 
  const trigger = useRef<any>(null);
    const sidebar = useRef<any>(null);
  // close on click outside
    useEffect(() => {
      const clickHandler = ({ target }: MouseEvent) => {
        if (!sidebar.current || !trigger.current) return;
        if (
          !sidebarOpen ||
          sidebar.current.contains(target) ||
          trigger.current.contains(target)
        )
          return;
        setSidebarOpen(false);
      };
      document.addEventListener('click', clickHandler);
      return () => document.removeEventListener('click', clickHandler);
    });

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 hidden md:block">
      <div className="p-4 text-xl font-bold">Studio</div>
      <nav className="px-2">
        {items.map(i=>(
          <NavLink key={i.to} to={i.to} end
            className={({isActive})=>`flex items-center gap-3 p-3 rounded-md mb-1 ${isActive ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <div className="text-lg">{i.icon}</div>
            <div>{i.label}</div>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
