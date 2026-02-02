import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import { Home, Settings, HelpCircle, LogIn } from 'lucide-react';

interface User {
  first_name?: string;
  last_name?: string;
  email?: string;
}

const DropdownUserLogin = () => {
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

  const handleSignin = () => {
    setDropdownOpen(false);
    navigate('/auth/signin', { replace: true });
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
          <span className="block text-xs text-gray-500 dark:text-slate-300">
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
            <NavLink to="/settings" className={itemClass} onClick={() => setDropdownOpen(false)}>
              <Settings size={18} />
              Settings
            </NavLink>
          </li>

          <li>
            <NavLink to="home/help" className={itemClass} onClick={() => setDropdownOpen(false)}>
              <HelpCircle size={18} />
              Help
            </NavLink>
          </li>
        </ul>

        <div className="border-t border-gray-200 dark:border-strokedark" />

        <button
          onClick={handleSignin}
          className="
            flex items-center gap-3 w-full
            rounded-b-2xl px-4 py-3
            text-sm font-medium
            transition-colors
            hover:bg-gray-100
            dark:hover:bg-meta-4
          "
        >
          <LogIn size={18} />
          Sign-In
        </button>
      </div>
    </ClickOutside>
  );
};

export default DropdownUserLogin;
