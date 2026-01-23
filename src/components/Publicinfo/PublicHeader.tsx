import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LogoIcon from '../../images/logo/logo2.png';
import DropdownUserLogin from '../Header/DropdownUserLogin';
import DarkModeSwitcher from '../Header/DarkModeSwitcher';
import DropdownMessage from '../Header/DropdownMessage';
import DropdownNotification from '../Header/DropdownNotification';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const PublicHeader: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  expanded,
  setExpanded,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const mobileSearchRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  // Close mobile search when clicking outside (exclude the icon)
  useEffect(() => {
    if (!mobileSearchOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        mobileSearchRef.current?.contains(target) ||
        mobileSearchButtonRef.current?.contains(target)
      ) return; // click inside search area or icon, do nothing

      setMobileSearchOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileSearchOpen]);

  const SearchIcon = (
    <svg
      className="fill-body hover:fill-green-950 dark:fill-bodydark dark:hover:fill-green-950"
      width="20"
      height="20"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
      />
    </svg>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 py-2 md:px-6 2xl:px-11">

        {/* LEFT */}
        <div className="flex items-center  gap-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="hidden -ml-1 lg:flex w-10 h-10 items-center justify-center rounded text-title-md  hover:bg-gray-200  dark:hover:bg-meta-4"
          >
            ☰
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(prev => !prev); }}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded border border-stroke bg-white dark:bg-boxdark"
          >
            ☰
          </button>

          <Link to="/">
            <img src={LogoIcon} alt="Logo" className="w-10 h-12" />
          </Link>
        </div>

        {/* DESKTOP SEARCH */}
        <div className="hidden sm:block flex-1 max-w-md mx-6">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <button type="submit" className="absolute left-0 top-1/2 -translate-y-1/2">
                {SearchIcon}
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-4 focus:outline-none dark:text-white"
              />
            </div>
          </form>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* MOBILE SEARCH ICON */}
          <button
            ref={mobileSearchButtonRef}
            onClick={() => setMobileSearchOpen(prev => !prev)}
            className="sm:hidden w-10 h-10 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-meta-4"
          >
            {SearchIcon}
          </button>

          <DarkModeSwitcher />
          <DropdownMessage />
          <DropdownNotification />
          <DropdownUserLogin />
        </div>
      </div>

      {/* MOBILE SEARCH BAR */}
      {mobileSearchOpen && (
        <div ref={mobileSearchRef} className="sm:hidden px-4 pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <button type="submit" className="absolute left-0 top-1/2 -translate-y-1/2">
                {SearchIcon}
              </button>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-4 focus:outline-none dark:text-white"
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
