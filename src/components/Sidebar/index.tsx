import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Settings,
  HeartHandshake,
  Handshake,
} from 'lucide-react';

import { GrRun } from "react-icons/gr";
import { GiMicrophone } from 'react-icons/gi';
import { FcConferenceCall } from "react-icons/fc";
import { RiMovieAiLine } from 'react-icons/ri';
import { CiMoneyCheck1, CiShoppingCart, CiVideoOn } from "react-icons/ci";
import { IoRadioOutline } from "react-icons/io5";

const iconClass = 'w-5 h-5 ';
const iconClas = 'w-6 h-6';

const RunIcon = () => <GrRun className={iconClas} />;
const InterviewIcon = () => <GiMicrophone className={iconClas} />;
const Operation = () => <Handshake className={iconClass} />;
const Conference = () => <FcConferenceCall className={iconClas} />;
const Highlights = () => <CiVideoOn className={iconClas} />;
const Scenes = () => <RiMovieAiLine className={iconClas} />;
const Plan = () => <CiMoneyCheck1 className={iconClas} />;
const Shop = () => <CiShoppingCart className={iconClas} />;
const Live = () => (
  <div className="flex items-center gap-1 text-red rounded-md">
    <IoRadioOutline className="w-6 h-6" />
  </div>
);

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

type MenuItem = {
  label: string;
  to: string;
  icon: React.FC;
  state?: {
    category_id: number;
    category_name: string;
  };
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const Tooltip = ({ label }: { label: string }) => (
  <span
    className="
      absolute left-full top-1/2 -translate-y-1/2 ml-2
      whitespace-nowrap rounded
      bg-gray-900 px-2 py-1 text-xs text-white shadow-lg
      opacity-0 group-hover:opacity-100
      transition-opacity
      z-50 pointer-events-none
    "
  >
    {label}
  </span>
);

const MENU: MenuSection[] = [
  {
    title: '',
    items: [
      { label: 'Home', to: '/', icon: HomeIcon },
      { label: 'Live', to: '/live', icon: Live },
      { label: 'Trending', to: '/trends', icon: ChartIcon },
      { label: 'Last Videos', to: '/last', icon: LatestIcon },
    ],
  },

  {
    title: 'Plans ',
    items: [{ label: 'Update your Plan', to: '/plans', icon: Plan }],
  },

  {
    title: 'Explore',
    items: [
      {
        label: 'Highlights',
        to: '/',
        state: { category_id: 1, category_name: 'Highlights' },
        icon: Highlights,
      },
      {
        label: 'Training',
        to: '/',
        state: { category_id: 2, category_name: 'Training' },
        icon: RunIcon,
      },
      {
        label: 'Operations',
        to: '/',
        state: { category_id: 3, category_name: 'Operations' },
        icon: Operation,
      },
      {
        label: 'Interview',
        to: '/',
        state: { category_id: 4, category_name: 'Interview' },
        icon: InterviewIcon,
      },
      {
        label: 'Press Conference',
        to: '/',
        state: { category_id: 5, category_name: 'Press Conference' },
        icon: Conference,
      },
      {
        label: 'Behind the Scenes',
        to: '/',
        state: { category_id: 6, category_name: 'Behind the Scenes' },
        icon: Scenes,
      },
    ],
  },

  {
    title: '',
    items: [
      { label: 'Settings', to: '/settings', icon: Settings },
      { label: 'Help', to: '/help', icon: HeartHandshake },
    ],
  },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  expanded: boolean;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen, expanded }: SidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const activeCategoryId = (location.state as any)?.category_id;

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
        transition-[width,transform] duration-300 ease-in-out
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
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const itemCategoryId = item.state?.category_id;

                  return (
                    <li
                      key={item.label}
                      className={`group relative ${
                        !expanded && !isMobile ? 'overflow-visible w-full' : ''
                      }`}
                    >
                      <NavLink
                        to={item.to}
                        state={item.state}
                        onClick={() => isMobile && setSidebarOpen(false)}
                        className={({ isActive }) => {
                          const isCategoryActive =
                            !!itemCategoryId &&
                            Number(activeCategoryId) === Number(itemCategoryId);

                          const active =
                            isCategoryActive ||
                            (!activeCategoryId && item.label === 'Home' && isActive) ||
                            (!itemCategoryId && item.label !== 'Home' && isActive);

                          return `${
                            !expanded && !isMobile
                              ? 'flex flex-col items-center justify-center py-2 px-1 rounded-lg w-full'
                              : 'flex items-center gap-3 px-3 py-2 rounded-lg'
                          } ${
                            active
                              ? 'bg-gray-100 dark:bg-meta-4 font-medium'
                              : 'hover:bg-gray-50 dark:hover:bg-meta-4'
                          }`;
                        }}
                      >
                        <Icon />

                        {!expanded && !isMobile ? (
                          <span className="text-xs mt-1 text-center">
                            {item.label}
                          </span>
                        ) : (
                          <span className="text-md">{item.label}</span>
                        )}

                        {!expanded && !isMobile && <Tooltip label={item.label} />}
                      </NavLink>
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

export default Sidebar;