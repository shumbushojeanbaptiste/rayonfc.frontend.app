import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import {
  Home,
  User as UserIcon,
  Settings,
  LayoutDashboard,
  LogOut,
  BadgeDollarSign,
} from 'lucide-react';

interface User {
  first_name?: string;
  last_name?: string;
  email?: string;
}

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const user: User | null = (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `
      flex items-center gap-3
      rounded-lg px-4 py-3
      transition-colors
      hover:bg-gray-100 dark:hover:bg-meta-4
      ${isActive ? 'bg-gray-100 dark:bg-meta-4 font-medium' : ''}
    `;

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      {/* TRIGGER */}
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          setDropdownOpen((prev) => !prev);
        }}
        className="flex items-center gap-4"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-slate-300">
            {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
          </span>
          <span className="block text-xs text-gray-500 dark:text-slate-400">
            {user?.email}
          </span>
        </span>

        <span className="h-10 w-10 rounded-full overflow-hidden">
          <img src="/default-avatar.png" alt="User" />
        </span>
      </Link>

      {/* DROPDOWN */}
      <div
        className={`
          absolute right-0 top-full mt-2 w-64
          rounded-2xl bg-white
          shadow-xl ring-1 ring-black/5
          dark:bg-boxdark
          transform transition-all duration-200 ease-out
          ${
            dropdownOpen
              ? 'scale-100 opacity-100 visible'
              : 'scale-95 opacity-0 invisible'
          }
        `}
      >
        <ul className="py-2 text-sm text-gray-800 dark:text-gray-400">
          <li>
            <NavLink to="/" className={itemClass} onClick={() => setDropdownOpen(false)}>
              <Home size={18} />
              Home
            </NavLink>
          </li>

          <li>
            <NavLink to="/profile" className={itemClass} onClick={() => setDropdownOpen(false)}>
              <UserIcon size={18} />
              My Profile
            </NavLink>
          </li>

          <li>
            <NavLink to="/studio" className={itemClass} onClick={() => setDropdownOpen(false)}>
              <LayoutDashboard size={18} />
              Studio
            </NavLink>
          </li>
          <li>
            <NavLink to="/finance" className={itemClass} onClick={() => setDropdownOpen(false)}>
              <BadgeDollarSign size={18} />
              Finance 
            </NavLink>
          </li>

         {/* <li>
            <NavLink to="/settings" className={itemClass} onClick={() => setDropdownOpen(false)}>
              <Settings size={18} />
              Account Settings
            </NavLink>
          </li>*/}

          
        </ul>

        <div className="border-t border-gray-200 dark:border-strokedark" />

        <button
          onClick={handleLogout}
          className="
            flex items-center gap-3 w-full
            rounded-b-2xl px-4 py-3
            text-sm font-medium
            transition-colors
            hover:bg-gray-100
            dark:hover:bg-meta-4
          "
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </ClickOutside>
  );
};

export default DropdownUser;
