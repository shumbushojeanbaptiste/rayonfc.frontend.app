import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoIcon from "../../images/logo/logo2.png";
import DropdownNotification from "../Header/DropdownNotification";
import DropdownUser from "../Header/DropdownUser";
import BalanceDeposit from "../balance/BalanceDeposit";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Example suggestions (replace with API later)
const SUGGESTIONS = [
  "React tutorials",
  "Music videos",
  "Gaming highlights",
  "Trending news",
  "Latest movies",
  "JavaScript tips",
  "Sports highlights",
  "Funny videos",
  "Documentaries",
  "Short films",
];

const Stopbar: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  expanded,
  setExpanded,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const desktopSearchRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchButtonRef = useRef<HTMLButtonElement | null>(null);

  // Submit search
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
      setFilteredSuggestions([]);
      setActiveSuggestionIndex(-1);
    }
  };

  // Update suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuggestions([]);
      setActiveSuggestionIndex(-1);
      return;
    }

    const filtered = SUGGESTIONS.filter((s) =>
      s.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
    setFilteredSuggestions(filtered);
    setActiveSuggestionIndex(-1);
  }, [searchQuery]);

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (filteredSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      if (activeSuggestionIndex >= 0) {
        setSearchQuery(filteredSuggestions[activeSuggestionIndex]);
      }
      handleSearch();
    } else if (e.key === "Escape") {
      setFilteredSuggestions([]);
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        desktopSearchRef.current?.contains(target) ||
        mobileSearchRef.current?.contains(target) ||
        mobileSearchButtonRef.current?.contains(target)
      )
        return;
      setMobileSearchOpen(false);
      setFilteredSuggestions([]);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const SearchIcon = (
    <svg
      className="fill-gray-500 hover:fill-gray-700 dark:fill-gray-400 dark:hover:fill-gray-200 transition-colors"
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
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-boxdark drop-shadow-sm dark:drop-shadow-none">
      <div className="flex items-center justify-between px-4 py-2 md:px-6 2xl:px-11">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Desktop toggle */}
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="hidden lg:flex w-10 h-10 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-meta-4 dark:text-slate-300 transition"
          >
            ☰
          </button>

          {/* Mobile toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMobileSidebarOpen((prev) => !prev);
            }}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded border border-stroke bg-white dark:bg-boxdark transition"
          >
            ☰
          </button>

          <Link to="/">
            <img src={LogoIcon} alt="Logo" className="w-10 h-12" />
          </Link>
        </div>

        {/* DESKTOP SEARCH */}
        <div
          ref={desktopSearchRef}
          className="hidden sm:block flex-1 max-w-lg mx-6 relative"
        >
          <form onSubmit={handleSearch}>
            <div className="relative group">
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200 transition-colors"
              >
                {SearchIcon}
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search videos, music, and more..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full py-2.5 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition text-sm"
              />
              {filteredSuggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                  {filteredSuggestions.map((sugg, index) => (
                    <li
                      key={sugg}
                      onMouseDown={() => {
                        setSearchQuery(sugg);
                        handleSearch({ preventDefault: () => {} } as any);
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        index === activeSuggestionIndex
                          ? "bg-gray-100 dark:bg-gray-700"
                          : ""
                      }`}
                    >
                      {sugg}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* MOBILE SEARCH */}
          <button
            ref={mobileSearchButtonRef}
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            className="sm:hidden w-10 h-10 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-meta-4 transition-colors"
          >
            {SearchIcon}
          </button>

          <DropdownNotification />
          <BalanceDeposit />
          <DropdownUser />
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div
        ref={mobileSearchRef}
        className={`sm:hidden px-4 transition-all duration-300 ease-in-out ${
          mobileSearchOpen
            ? "max-h-80 opacity-100 mt-2"
            : "max-h-0 opacity-0 mt-0 overflow-hidden"
        }`}
      >
        <form onSubmit={handleSearch}>
          <div className="relative">
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {SearchIcon}
            </button>
            <input
              autoFocus={mobileSearchOpen}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search videos, music, and more..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full py-3 pl-11 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition text-base"
            />
            {filteredSuggestions.length > 0 && (
              <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                {filteredSuggestions.map((sugg, index) => (
                  <li
                    key={sugg}
                    onMouseDown={() => {
                      setSearchQuery(sugg);
                      handleSearch({ preventDefault: () => {} } as any);
                    }}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      index === activeSuggestionIndex
                        ? "bg-gray-100 dark:bg-gray-700"
                        : ""
                    }`}
                  >
                    {sugg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>
      </div>
    </header>
  );
};

export default Stopbar;
