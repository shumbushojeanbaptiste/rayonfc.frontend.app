import React, { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";

/* ---------------- ICONS ---------------- */
const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
  </svg>
);
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 10V8a6 6 0 1112 0v2h1v10H5V10h1z" />
  </svg>
);
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 14a5 5 0 010-7l2-2a5 5 0 017 7l-1 1" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);
const AnalyticsIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 12h3v8H3zM10 8h3v12h-3zM17 4h3v16h-3z" />
  </svg>
);
const CommentsIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const PlayIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

/* ---------------- TYPES ---------------- */
type Tab =
  | "videos"
  | "shorts"
  | "live"
  | "posts"
  | "playlists"
  | "podcasts"
  | "courses"
  | "promotions"
  | "collaborations";

interface Item {
  id: string;
  type: Tab;
  title: string;
  thumbnail: string;
  duration: string;
  visibility: "Public" | "Private" | "Unlisted";
  created_at: string;
  views: number;
  comments: number;
  status: string;
}

/* ---------------- TABS ---------------- */
const TABS: { key: Tab; label: string }[] = [
  { key: "videos", label: "Videos" },
  { key: "shorts", label: "Shorts" },
  { key: "live", label: "Live" },
  { key: "posts", label: "Posts" },
  { key: "playlists", label: "Playlists" },
  { key: "podcasts", label: "Podcasts" },
  { key: "courses", label: "Courses" },
  { key: "promotions", label: "Promotions" },
  { key: "collaborations", label: "Collaborations" },
];

/* ---------------- MOCK DATA ---------------- */
const MOCK_ITEMS: Item[] = [
  {
    id: "1",
    type: "videos",
    title: "SONG OF SONGS | The Holy Fire: Love Strong as Death",
    thumbnail: "https://i.ytimg.com/vi/ysz5S6PUM-U/maxresdefault.jpg",
    duration: "1:41:34",
    visibility: "Public",
    created_at: "2026-01-19",
    views: 326,
    comments: 9,
    status: "Published",
  },
  {
    id: "2",
    type: "shorts",
    title: "Love is Strong ",
    thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
    duration: "0:58",
    visibility: "Public",
    created_at: "2026-01-18",
    views: 1200,
    comments: 14,
    status: "Published",
  },
  {
    id: "3",
    type: "podcasts",
    title: "Song of Songs – Episode 1",
    thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg",
    duration: "48:12",
    visibility: "Public",
    created_at: "2026-01-10",
    views: 89,
    comments: 3,
    status: "Published",
  },
  {
    id: "4",
    type: "courses",
    title: "Song of Songs – Full Course",
    thumbnail: "https://i.ytimg.com/vi/ScMzIvxBSi4/maxresdefault.jpg",
    duration: "6h 12m",
    visibility: "Private",
    created_at: "2025-12-01",
    views: 42,
    comments: 0,
    status: "Draft",
  },
];

/* ---------------- MAIN ---------------- */
export default function Content() {
  const [items, setItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("videos");

  useEffect(() => {
    setItems(MOCK_ITEMS);
  }, []);

  const data = items.filter((i) => i.type === activeTab);

  return (
    <div className="text-slate-400 p-4 sm:p-6 min-h-screen text-sm">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
        <h1 className="text-2xl font-medium">Channel content</h1>
        <button className="bg-[#D1D100] text-black-2 px-4 py-2 rounded">
          Create
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-8 border-b border-[#2a2a2a] mb-4 overflow-x-auto whitespace-nowrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 ${
              activeTab === t.key
                ? "border-b-2 border-white text-slate-300 font-medium"
                : "text-[#aaaaaa] hover:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TABLE */}
      {data.length ? <VideosTable data={data} /> : <EmptyState />}
    </div>
  );
}

/* ---------------- TABLE ---------------- */
function VideosTable({ data }: { data: Item[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border border-[#2a2a2a] bg-gray-900 rounded">
        <thead className="text-[#aaaaaa] text-[12.5px]">
          <tr>
            <th />
            <th className="text-left px-3 py-2">Video</th>
            <th>Visibility</th>
            <th>Date</th>
            <th>Views</th>
            <th>Comments</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data.map((v) => (
            <tr key={v.id} className="group hover:bg-gray-800">
              <td className="px-3">
                <input type="checkbox" />
              </td>

              <td className="px-3 py-3 flex gap-3">
                <div className="relative w-32 sm:w-40 h-[72px] sm:h-[90px] shrink-0">
                  <img
                    src={v.thumbnail}
                    className="w-full h-full object-cover rounded"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[11px] px-1 rounded">
                    {v.duration}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="font-medium leading-tight line-clamp-2">
                    {v.title}
                  </div>
                  <div className="text-xs text-[#717171] mt-1">
                    {v.status}
                  </div>

                  <div className="flex gap-4 mt-2 text-[#aaaaaa] opacity-80 group-hover:opacity-100">
                    <EditIcon />
                    <AnalyticsIcon />
                    <CommentsIcon />
                    <PlayIcon />
                  </div>
                </div>
              </td>

              

              <td className="text-center text-[#aaaaaa]">
                {new Date(v.created_at).toLocaleDateString()}
              </td>
              <td className="text-center">{v.views}</td>
              <td className="text-center">{v.comments}</td>

              <td className="text-right px-3">⋮</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-10 text-center text-[#717171]">
      No content available.
    </div>
  );
}
