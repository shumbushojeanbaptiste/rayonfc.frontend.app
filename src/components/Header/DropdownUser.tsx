import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClickOutside from '../ClickOutside';

interface User {
  first_name?: string;
  last_name?: string;
  email?: string;
}

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate(); 

  // 🔹 Read signed-in user from localStorage instead of sessionStorage
  const user: User | null = (() => {
    try {
      const stored = localStorage.getItem('user'); // ✅ Changed to localStorage
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('token'); // ✅ Changed to localStorage
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        to="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
          </span>
          <span className="block text-xs text-gray-500">
            {user?.email}
          </span>
        </span>

        <span className="h-12 w-12 rounded-full">
          <img src="/default-avatar.png" alt="User" />
        </span>

        <svg
          className="hidden fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.41 0.91a1 1 0 0 1 1.18 0L6 5.32l4.41-4.41a.83.83 0 1 1 1.18 1.18l-5 5a.83.83 0 0 1-1.18 0l-5-5a.83.83 0 0 1 0-1.18z"
          />
        </svg>
      </Link>

      {dropdownOpen && (
        <div className="absolute right-0 mt-4 w-62.5 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <ul className="flex flex-col gap-5 border-b px-6 py-7.5 dark:border-strokedark">
            <li>
              <Link to="/" className="hover:text-gray-300">
                Home
              </Link>
            </li>
            {/*<li>
              <Link to="/profile" className="hover:text-green-900">
                My Profile
              </Link>
            </li>
            <li>
              <Link to="/settings" className="hover:text-green-900">
                Account Settings
              </Link>
            </li>*/}
            <li>
              <Link to="/studio" className="hover:text-gray-300">
                Studio
              </Link>
            </li>
          </ul>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 px-6 py-4 text-sm font-medium hover:text-gray-300"
          >
            Log Out
          </button>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;
