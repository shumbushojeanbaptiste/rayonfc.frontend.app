import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  Clock,
  Plus,
  Compass,
  Film,
  Music,
  Gamepad2,
  Newspaper,
  Trophy,
  Users,
  Library,
  History,
  Bookmark,
  User,
  Bolt,
  Settings,
  HeartHandshake,
  Clapperboard,
  Music4,
} from 'lucide-react';

/* ICON PROPS */
const iconClass = 'w-5 h-5';

/* ICON WRAPPERS */
const HomeIcon = () => <Home className={iconClass} />;
const ChartIcon = () => <TrendingUp className={iconClass} />;
const LatestIcon = () => <Clock className={iconClass} />;
const PlusIcon = () => <Plus className={iconClass} />;
const ExploreIcon = () => <Compass className={iconClass} />;
const ShortsIcon = () => <Film className={iconClass} />;
const MusicIcon = () => <Music className={iconClass} />;
const GamingIcon = () => <Gamepad2 className={iconClass} />;
const NewsIcon = () => <Newspaper className={iconClass} />;
const SportsIcon = () => <Trophy className={iconClass} />;
const SubsIcon = () => <Users className={iconClass} />;
const LibraryIcon = () => <Library className={iconClass} />;
const HistoryIcon = () => <History className={iconClass} />;
const WatchLaterIcon = () => <Bookmark className={iconClass} />;

/* TOOLTIP */
const Tooltip = ({ label }: { label: string }) => (
  <span
    className="
      absolute left-full top-1/2 -translate-y-1/2 ml-3
      whitespace-nowrap rounded
      bg-gray-900 px-2 py-1 text-xs text-white shadow-lg
      opacity-0 group-hover:opacity-100
      transition-opacity duration-200
      z-[9999] pointer-events-none
    "
  >
    {label}
  </span>
);

/* MENU */
const MENU = [
  {
    title: '',
    items: [
      { label: 'Home', to: '/', icon: HomeIcon },
      { label: 'Reels', to: '/reels', icon: Clapperboard },
      { label: 'Trending', to: '/Trendsvideos', icon: ChartIcon },
      { label: 'Latest', to: '/latest', icon: LatestIcon },
      { label: 'Free Videos', to: '/freevideos', icon: PlusIcon },
    ],
  },
  {
    title: 'You',
    items: [
      { label: 'Sign-In', to: '/auth/signin', icon: User },
      { label: 'Sign-Up', to: '/auth/signup', icon: WatchLaterIcon },
    ],
  },
  {
    title: 'Explore',
    items: [
      { label: 'Music', to: '/music', icon: MusicIcon },
      { label: 'Gaming', to: '/gaming', icon: GamingIcon },
      { label: 'News', to: '/news', icon: NewsIcon },
      { label: 'Sports', to: '/sports', icon: SportsIcon },
    ],
  },
  {
    title: '',
    items: [
      { label: 'Settings', to: '/settings', icon: Settings },
      { label: 'Help', to: 'home/help', icon: HeartHandshake },
    ],
  },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  expanded: boolean;
}

const Sidebartwo = ({ sidebarOpen, setSidebarOpen, expanded }: SidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
  if (sidebarOpen && isMobile) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}, [sidebarOpen, isMobile]);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`group/sidebar fixed lg:static left-0 z-50 h-[calc(100vh-64px)]
        bg-white dark:bg-boxdark
        transition-[width,transform] duration-300 ease-out
        ${expanded || isMobile ? 'w-56' : 'w-20'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-lg flex flex-col`}
      >
        <nav
          className={`
            px-2 pt-4 flex-1 flex flex-col
            overflow-y-auto
            overscroll-contain
            touch-pan-y
            lg:scroll-smooth
            ${
              !expanded && !isMobile
                ? 'pb-24 no-scrollbar'
                : expanded
                ? `
                    pb-24
                    no-scrollbar
                    group-hover/sidebar:scrollbar-thin
                    group-hover/sidebar:scrollbar-thumb-neutral-400
                    dark:group-hover/sidebar:scrollbar-thumb-neutral-600
                  `
                : 'pb-24 scrollbar-thin scrollbar-thumb-neutral-400 dark:scrollbar-thumb-neutral-600'
            }
          `}
          style={{ scrollPaddingBottom: '6rem' }}
        >
          {MENU.map((section, index) => (
            <div key={section.title || index} className="mb-3">
              {index !== 0 && (
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
              )}

              {section.title && (expanded || isMobile) && (
                <div className="px-3 py-2 text-xs font-semibold uppercase opacity-60">
                  {section.title}
                </div>
              )}

              <ul
                className={`${
                  !expanded && !isMobile
                    ? 'flex flex-col items-center space-y-2'
                    : 'space-y-1'
                }`}
              >
                {section.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.label}
                      className={`group relative ${
                        !expanded && !isMobile ? 'overflow-visible w-full' : ''
                      }`}
                    >
                      <NavLink
                        to={item.to}
                        onClick={() => isMobile && setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `${
                            !expanded && !isMobile
                              ? 'flex flex-col items-center justify-center py-2 px-1 rounded-lg w-full'
                              : 'flex items-center gap-3 px-3 py-2 rounded-lg'
                          } ${
                            isActive
                              ? 'bg-gray-100 dark:bg-meta-4 font-medium'
                              : 'hover:bg-gray-50 dark:hover:bg-meta-4'
                          }`
                        }
                      >
                        <Icon />
                        {!expanded && !isMobile ? (
                          <span className="text-xs mt-1 text-center">
                            {item.label}
                          </span>
                        ) : (
                          <span className="text-md">{item.label}</span>
                        )}
                      </NavLink>

                      {!expanded && !isMobile && (
                        <Tooltip label={item.label} />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebartwo;
