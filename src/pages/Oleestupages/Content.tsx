import React, { useEffect, useState } from "react";
import api from "../../api";

/* ---------------- ICONS ---------------- */
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

const toMediaUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("blob:")) return path;
  if (path.startsWith("data:")) return path;
  if (path.startsWith("https://")) return path;
  if (path.startsWith("http://")) return path.replace("http://", "https://");

  return `${api.defaults.baseURL}${path.startsWith("/") ? path : `/${path}`}`;
};

export default function Content() {
  const [items, setItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("videos");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadPendingVideos = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await api.get("/api/videos/videoList");
      const list = res?.data?.data || [];

      const mappedVideos: Item[] = list.map((v: any) => ({
        id: String(v.video_id ?? v.id),
        type: "videos",
        title: v.title || "Untitled video",
        thumbnail: toMediaUrl(v.thumbnail || v.thumbnail_url),
        duration: v.duration || "0:00",
        visibility: Number(v.status) === 1 ? "Public" : "Private",
        created_at: v.created_at || "",
        views: Number(v.views || 0),
        comments: Array.isArray(v.comments) ? v.comments.length : Number(v.comments || 0),
        status: Number(v.status) === 1 ? "Published" : "Pending Review",
      }));

      setItems(mappedVideos);
    } catch (err: any) {
      console.error("CONTENT LOAD ERROR:", err?.response?.data || err?.message || err);
      setErrorMessage(err?.response?.data?.message || "Failed to load videos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingVideos();
  }, []);

  const data = items.filter((i) => i.type === activeTab);

  return (
    <div className="text-slate-400 p-4 sm:p-6 min-h-screen text-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
        <h1 className="text-2xl font-medium">Rayonsports contents</h1>

        <button
          onClick={loadPendingVideos}
          className="bg-[#1f46c5] text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

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

      {errorMessage && (
        <div className="mb-4 rounded bg-red-500/10 text-red-300 p-4">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-[#717171]">Loading content...</div>
      ) : data.length ? (
        <VideosTable data={data} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

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
                  {v.thumbnail ? (
                    <img
                      src={v.thumbnail}
                      className="w-full h-full object-cover rounded"
                      alt={v.title}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center text-xs">
                      No thumbnail
                    </div>
                  )}

                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[11px] px-1 rounded">
                    {v.duration}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="font-medium leading-tight line-clamp-2 text-slate-300">
                    {v.title}
                  </div>

                  <div className="text-xs text-yellow-400 mt-1">
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
                {v.visibility}
              </td>

              <td className="text-center text-[#aaaaaa]">
                {v.created_at ? new Date(v.created_at).toLocaleDateString() : "--"}
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