
import React from "react";
import { HiSearch, HiBell, HiUserCircle, HiSun, HiMoon } from "react-icons/hi";

export default function Stopbar({dark, setDark}:{dark:boolean,setDark:any}){
  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="text-lg font-semibold">Oleeplay Studio</div>
        <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1 gap-2">
          <HiSearch />
          <input placeholder="Search videos, analytics, settings..." className="bg-transparent outline-none text-sm w-72" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><HiBell /></button>
        <button onClick={()=>setDark(!dark)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"></button>
        
      </div>
    </header>
  );
}
