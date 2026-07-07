import React, { useEffect, useRef, useState } from "react";
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

const DotsIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 8a2 2 0 100-4 2 2 0 000 4zM12 14a2 2 0 100-4 2 2 0 000 4zM12 20a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const VisibilityOffIcon = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.94 10.94 0 0112 20C7 20 2.73 16.89 1 12a12.1 12.1 0 014.22-5.95" />
    <path d="M9.9 4.24A11.6 11.6 0 0112 4c5 0 9.27 3.11 11 8a12.1 12.1 0 01-2.3 3.61" />
    <path d="M14.12 14.12A3 3 0 019.88 9.88" />
    <path d="M1 1l22 22" />
  </svg>
);

const TrashIcon = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const PublishIcon = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
    <path d="M5 21h14" />
  </svg>
);

type Tab =
  | "videos"
  | "public"
  | "private"
  | "progress"
  | "removed"
  | "shorts"
  | "live"
  | "posts"
  | "playlists"
  | "podcasts"
  | "courses"
  | "promotions"
  | "collaborations";

type ConfirmAction = "publish" | "unpublish" | "remove" | null;

interface Item {
  id: string;
  type: Tab;
  title: string;
  thumbnail: string;
  duration: string;
  visibility: "Public" | "Private" | "Unlisted" | "Removed" | "Processing";
  created_at: string;
  views: number;
  comments: number;
  status: string;
  progress?: number;
  raw?: any;
}

interface EditForm {
  title: string;
  description: string;
  category: string;
  price: string;
  is_premium: string;
  currency_id: string;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "videos", label: "Pending Videos" },
  { key: "public", label: "Public Videos" },
  { key: "private", label: "Private Videos" },
  { key: "progress", label: "Progressing Videos" },
  { key: "removed", label: "Removed Videos" },
  { key: "shorts", label: "Shorts" },
  { key: "live", label: "Live" },
];

const toMediaUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("blob:")) return path;
  if (path.startsWith("data:")) return path;
  if (path.startsWith("https://")) return path;
  if (path.startsWith("http://")) return path.replace("http://", "https://");

  return `${api.defaults.baseURL}${path.startsWith("/") ? path : `/${path}`}`;
};

const getPlayableUrl = (item: Item) => {
  const raw = item.raw || {};

  const possibleUrl =
    raw?.video_url ||
    raw?.url ||
    raw?.video ||
    raw?.video_file ||
    raw?.file_url ||
    raw?.video_file_url ||
    raw?.hls_url ||
    raw?.stream_url ||
    raw?.path ||
    "";

  return toMediaUrl(possibleUrl);
};

const getLoggedInUserId = (): number => {
  try {
    const candidates = [
      localStorage.getItem("auth_user"),
      localStorage.getItem("user"),
      localStorage.getItem("currentUser"),
    ].filter(Boolean);

    for (const raw of candidates) {
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const possibleId =
        parsed?.user_id ??
        parsed?.id ??
        parsed?.data?.user_id ??
        parsed?.data?.id;

      if (
        possibleId !== undefined &&
        possibleId !== null &&
        !Number.isNaN(Number(possibleId))
      ) {
        return Number(possibleId);
      }
    }
  } catch (err) {
    console.error("Could not detect logged in user id:", err);
  }

  return 1;
};

const getProgressValue = (v: any) => {
  const raw =
    v?.progress ??
    v?.percentage ??
    v?.percent ??
    v?.publish_progress ??
    v?.processing_progress ??
    v?.upload_progress ??
    0;

  const n = Number(raw);
  if (Number.isNaN(n)) return 0;

  return Math.min(100, Math.max(0, Math.round(n)));
};

const getVideoId = (v: any) => String(v?.video_id ?? v?.id ?? "");

const mapVideoToItem = (v: any, type: Tab): Item => {
  const statusNumber = Number(v?.status);
  const progress = getProgressValue(v);

  let visibility: Item["visibility"] =
    statusNumber === 1 ? "Public" : statusNumber === 0 ? "Private" : "Unlisted";

  let status = statusNumber === 1 ? "Published" : "Pending Review";

  if (type === "public") {
    visibility = "Public";
    status = "Published";
  }

  if (type === "private") {
    visibility = "Private";
    status = "Private";
  }

  if (type === "progress") {
    visibility = "Processing";
    status =
      v?.message ||
      v?.stage ||
      v?.progress_status ||
      v?.status_text ||
      v?.processing_status ||
      "Processing";
  }

  if (type === "removed") {
    visibility = "Removed";
    status = "Removed";
  }

  return {
    id: getVideoId(v),
    type,
    title: v?.title || v?.video_title || "Untitled video",
    thumbnail: toMediaUrl(v?.thumbnail || v?.thumbnail_url || v?.thumbnail_file_url),
    duration: v?.duration || "0:00",
    visibility,
    created_at: v?.created_at || v?.updated_at || v?.removed_at || "",
    views: Number(v?.views || 0),
    comments: Array.isArray(v?.comments) ? v.comments.length : Number(v?.comments || 0),
    status,
    progress,
    raw: v,
  };
};

export default function Content() {
  const [items, setItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("videos");
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmItem, setConfirmItem] = useState<Item | null>(null);
  const [playerItem, setPlayerItem] = useState<Item | null>(null);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    title: "",
    description: "",
    category: "",
    price: "",
    is_premium: "0",
    currency_id: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadPendingVideos = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await api.get("/api/videos/videoList");
      const list = res?.data?.data || [];

      const mappedVideos: Item[] = list.map((v: any) => mapVideoToItem(v, "videos"));

      setItems(mappedVideos);
    } catch (err: any) {
      console.error("PENDING CONTENT LOAD ERROR:", err?.response?.data || err?.message || err);
      setErrorMessage(err?.response?.data?.message || "Failed to load pending videos.");
    } finally {
      setLoading(false);
    }
  };

  const loadPublicVideos = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await api.get("/api/videos/public/allVideos");
      const list = res?.data?.data || res?.data?.videos || res?.data || [];

      const mappedVideos: Item[] = Array.isArray(list)
        ? list.map((v: any) => mapVideoToItem(v, "public"))
        : [];

      setItems(mappedVideos);
    } catch (err: any) {
      console.error("PUBLIC CONTENT LOAD ERROR:", err?.response?.data || err?.message || err);
      setErrorMessage(err?.response?.data?.message || "Failed to load public videos.");
    } finally {
      setLoading(false);
    }
  };

  const loadPrivateVideos = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await api.get("/api/videos/private/allVideos");
      const list = res?.data?.data || res?.data?.videos || res?.data || [];

      const mappedVideos: Item[] = Array.isArray(list)
        ? list.map((v: any) => mapVideoToItem(v, "private"))
        : [];

      setItems(mappedVideos);
    } catch (err: any) {
      console.error("PRIVATE CONTENT LOAD ERROR:", err?.response?.data || err?.message || err);
      setErrorMessage(err?.response?.data?.message || "Failed to load private videos.");
    } finally {
      setLoading(false);
    }
  };

  const loadProgressVideos = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await api.get("/api/videos/progress");
      const list = res?.data?.data || res?.data?.videos || res?.data || [];

      const mappedVideos: Item[] = Array.isArray(list)
        ? list.map((v: any) => mapVideoToItem(v, "progress"))
        : [];

      setItems(mappedVideos);
    } catch (err: any) {
      console.error("PROGRESS CONTENT LOAD ERROR:", err?.response?.data || err?.message || err);
      setErrorMessage(err?.response?.data?.message || "Failed to load progressing videos.");
    } finally {
      setLoading(false);
    }
  };

  const loadRemovedVideos = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await api.get("/api/videos/removedVideos");
      const list = res?.data?.data || res?.data?.videos || res?.data || [];

      const mappedVideos: Item[] = Array.isArray(list)
        ? list.map((v: any) => mapVideoToItem(v, "removed"))
        : [];

      setItems(mappedVideos);
    } catch (err: any) {
      console.error("REMOVED CONTENT LOAD ERROR:", err?.response?.data || err?.message || err);
      setErrorMessage(err?.response?.data?.message || "Failed to load removed videos.");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentTab = async (tab: Tab = activeTab) => {
    setOpenMenuId("");

    if (tab === "videos") {
      await loadPendingVideos();
      return;
    }

    if (tab === "public") {
      await loadPublicVideos();
      return;
    }

    if (tab === "private") {
      await loadPrivateVideos();
      return;
    }

    if (tab === "progress") {
      await loadProgressVideos();
      return;
    }

    if (tab === "removed") {
      await loadRemovedVideos();
      return;
    }

    setItems([]);
  };

  useEffect(() => {
    loadCurrentTab(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "progress") return;

    const interval = window.setInterval(() => {
      loadProgressVideos();
    }, 5000);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const askConfirm = (action: ConfirmAction, item: Item) => {
    setOpenMenuId("");
    setPlayerItem(null);
    setConfirmAction(action);
    setConfirmItem(item);
  };

  const closeConfirm = () => {
    if (actionLoadingId) return;
    setConfirmAction(null);
    setConfirmItem(null);
  };

  const openPlayer = (item: Item) => {
    setOpenMenuId("");
    setPlayerItem(item);
  };

  const closePlayer = () => {
    setPlayerItem(null);
  };

  const openEditModal = (item: Item) => {
    const raw = item.raw || {};

    setOpenMenuId("");
    setPlayerItem(null);
    setErrorMessage("");
    setSuccessMessage("");
    setEditItem(item);
    setEditForm({
      title: raw?.title || raw?.video_title || item.title || "",
      description: raw?.description || raw?.video_description || "",
      category: String(raw?.category ?? raw?.category_id ?? ""),
      price: String(raw?.price ?? ""),
      is_premium: String(raw?.is_premium ?? 0),
      currency_id: String(raw?.currency_id ?? ""),
    });
  };

  const closeEditModal = () => {
    if (editLoading) return;
    setEditItem(null);
  };

  const handleEditChange = (
    field: keyof EditForm,
    value: string
  ) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSubmit = async () => {
    if (!editItem) return;

    if (!editForm.title.trim()) {
      setErrorMessage("Title is required.");
      return;
    }

    try {
      setEditLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      await api.put("/api/videos/edit", {
        owner_id: getLoggedInUserId(),
        video_id: Number(editItem.id),
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: Number(editForm.category || 0),
        price: Number(editForm.price || 0),
        is_premium: Number(editForm.is_premium || 0),
        currency_id: Number(editForm.currency_id || 0),
      });

      setSuccessMessage("Video metadata updated successfully.");
      setEditItem(null);
      await loadCurrentTab(activeTab);
    } catch (err: any) {
      console.error("EDIT VIDEO ERROR:", err?.response?.data || err?.message || err);
      setErrorMessage(err?.response?.data?.message || "Failed to update video metadata.");
    } finally {
      setEditLoading(false);
    }
  };

  const handlePublishVideo = async (videoId: string) => {
    if (!videoId) return;

    try {
      setActionLoadingId(videoId);
      setErrorMessage("");
      setSuccessMessage("");

      await api.put("/api/videos/verify", {
        video_id: Number(videoId),
        verified_by: getLoggedInUserId(),
        status: 1,
      });

      setSuccessMessage("Video published successfully.");
      setConfirmAction(null);
      setConfirmItem(null);
      await loadCurrentTab(activeTab);
    } catch (err: any) {
      console.error("PUBLISH ERROR:", err?.response?.data || err?.message || err);
      setErrorMessage(err?.response?.data?.message || "Failed to publish video.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleUnpublishVideo = async (videoId: string) => {
    if (!videoId) return;

    try {
      setActionLoadingId(videoId);
      setErrorMessage("");
      setSuccessMessage("");

      await api.put("/api/videos/verify", {
        video_id: Number(videoId),
        verified_by: getLoggedInUserId(),
        status: 0,
      });

      setSuccessMessage("Video unpublished successfully.");
      setConfirmAction(null);
      setConfirmItem(null);
      setActiveTab("videos");
      await loadPendingVideos();
    } catch (err: any) {
      console.error("UNPUBLISH ERROR:", err?.response?.data || err?.message || err);
      setErrorMessage(err?.response?.data?.message || "Failed to unpublish video.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRemoveVideo = async (videoId: string) => {
    if (!videoId) return;

    try {
      setActionLoadingId(videoId);
      setErrorMessage("");
      setSuccessMessage("");

      await api.delete("/api/videos/removeVideo", {
        data: {
          video_id: Number(videoId),
        },
      });

      setSuccessMessage("Video removed successfully.");
      setConfirmAction(null);
      setConfirmItem(null);
      await loadCurrentTab(activeTab);
    } catch (err: any) {
      console.error("REMOVE VIDEO ERROR:", err?.response?.data || err?.message || err);
      setErrorMessage(err?.response?.data?.message || "Failed to remove video.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleConfirmProceed = async () => {
    if (!confirmItem || !confirmAction) return;

    if (confirmAction === "publish") {
      await handlePublishVideo(confirmItem.id);
      return;
    }

    if (confirmAction === "unpublish") {
      await handleUnpublishVideo(confirmItem.id);
      return;
    }

    if (confirmAction === "remove") {
      await handleRemoveVideo(confirmItem.id);
    }
  };

  const data = items.filter((i) => i.type === activeTab);

  return (
    <div className="text-slate-400 p-4 sm:p-6 min-h-screen text-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
        <div>
          {/*<h1 className="text-2xl font-medium">Rayonsports contents</h1>
          <p className="text-xs text-[#8f8f8f] mt-1">
            Manage pending, public, progressing, and removed videos.
          </p>*/}
        </div>

        <button
          onClick={() => loadCurrentTab(activeTab)}
          className="bg-[#1f46c5] text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
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

      {successMessage && (
        <div className="mb-4 rounded bg-green-500/10 text-green-300 p-4">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded bg-red-500/10 text-red-300 p-4">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-[#717171]">Loading content...</div>
      ) : data.length ? (
        <VideosTable
          data={data}
          activeTab={activeTab}
          actionLoadingId={actionLoadingId}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onAskConfirm={askConfirm}
          onPlayVideo={openPlayer}
          onEditVideo={openEditModal}
        />
      ) : (
        <EmptyState />
      )}

      {confirmAction && confirmItem && (
        <ConfirmPopup
          item={confirmItem}
          action={confirmAction}
          loading={actionLoadingId === confirmItem.id}
          onCancel={closeConfirm}
          onProceed={handleConfirmProceed}
        />
      )}

      {playerItem && (
        <VideoPlayerModal
          item={playerItem}
          onClose={closePlayer}
          onAskConfirm={askConfirm}
        />
      )}

      {editItem && (
        <EditVideoModal
          item={editItem}
          form={editForm}
          loading={editLoading}
          onChange={handleEditChange}
          onCancel={closeEditModal}
          onSave={handleEditSubmit}
        />
      )}
    </div>
  );
}

function VideosTable({
  data,
  activeTab,
  actionLoadingId,
  openMenuId,
  setOpenMenuId,
  onAskConfirm,
  onPlayVideo,
  onEditVideo,
}: {
  data: Item[];
  activeTab: Tab;
  actionLoadingId: string;
  openMenuId: string;
  setOpenMenuId: (id: string) => void;
  onAskConfirm: (action: ConfirmAction, item: Item) => void;
  onPlayVideo: (item: Item) => void;
  onEditVideo: (item: Item) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1050px] border border-[#2a2a2a] bg-gray-900 rounded">
        <thead className="text-[#aaaaaa] text-[12.5px]">
          <tr>
            <th />
            <th className="text-left px-3 py-2">Video</th>
            <th>Visibility</th>
            <th>Date</th>
            {activeTab === "progress" && <th>Progress</th>}
            <th>Views</th>
            <th>Comments</th>
            <th className="text-right px-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((v) => (
            <tr key={v.id} className="group hover:bg-gray-800">
              <td className="px-3">
                <input type="checkbox" />
              </td>

              <td className="px-3 py-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => onPlayVideo(v)}
                  className="relative w-32 sm:w-40 h-[72px] sm:h-[90px] shrink-0 text-left"
                  title="Play video"
                >
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

                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white">
                      <PlayIcon />
                    </span>
                  </span>

                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[11px] px-1 rounded">
                    {v.duration}
                  </span>
                </button>

                <div className="min-w-0">
                  <div className="font-medium leading-tight line-clamp-2 text-slate-300">
                    {v.title}
                  </div>

                  <div
                    className={`text-xs mt-1 ${
                      activeTab === "removed"
                        ? "text-red-400"
                        : activeTab === "progress"
                        ? "text-blue-400"
                        : v.visibility === "Public"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {v.status}
                  </div>

                  <div className="flex gap-4 mt-2 text-[#aaaaaa] opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onEditVideo(v)}
                      className="transition hover:text-white"
                      title="Edit video"
                    >
                      <EditIcon />
                    </button>

                    <AnalyticsIcon />
                    <CommentsIcon />

                    <button
                      type="button"
                      onClick={() => onPlayVideo(v)}
                      className="transition hover:text-white"
                      title="Play video"
                    >
                      <PlayIcon />
                    </button>
                  </div>
                </div>
              </td>

              <td className="text-center text-[#aaaaaa]">{v.visibility}</td>

              <td className="text-center text-[#aaaaaa]">
                {v.created_at ? new Date(v.created_at).toLocaleDateString() : "--"}
              </td>

              {activeTab === "progress" && (
                <td className="px-3">
                  <div className="min-w-[140px]">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span>{v.progress ?? 0}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${v.progress ?? 0}%` }}
                      />
                    </div>
                  </div>
                </td>
              )}

              <td className="text-center">{v.views}</td>
              <td className="text-center">{v.comments}</td>

              <td className="px-3 text-right">
                <ActionMenu
                  item={v}
                  activeTab={activeTab}
                  isOpen={openMenuId === v.id}
                  disabled={actionLoadingId === v.id}
                  onToggle={() => setOpenMenuId(openMenuId === v.id ? "" : v.id)}
                  onClose={() => setOpenMenuId("")}
                  onAskConfirm={onAskConfirm}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionMenu({
  item,
  activeTab,
  isOpen,
  disabled,
  onToggle,
  onClose,
  onAskConfirm,
}: {
  item: Item;
  activeTab: Tab;
  isOpen: boolean;
  disabled: boolean;
  onToggle: () => void;
  onClose: () => void;
  onAskConfirm: (action: ConfirmAction, item: Item) => void;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;

      if (!menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const canPublish = activeTab === "videos" || activeTab === "private";
  const canUnpublish = activeTab === "public";
  const canRemove = activeTab !== "removed";

  return (
    <div ref={menuRef} className="relative inline-flex justify-end">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#aaaaaa] transition hover:bg-gray-700 hover:text-white disabled:opacity-60"
        title="Actions"
      >
        <DotsIcon />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-xl border border-[#2f2f2f] bg-[#111827] text-left shadow-2xl">
          {canPublish && (
            <button
              type="button"
              onClick={() => onAskConfirm("publish", item)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-green-300 transition hover:bg-green-500/10"
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <PublishIcon />
              </span>
              <span>
                {activeTab === "private" ? "Publish publicly" : "Publish video"}
              </span>
            </button>
          )}

          {canUnpublish && (
            <button
              type="button"
              onClick={() => onAskConfirm("unpublish", item)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-yellow-300 transition hover:bg-yellow-500/10"
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <VisibilityOffIcon />
              </span>
              <span>Unpublish video</span>
            </button>
          )}

          {canRemove && (
            <button
              type="button"
              onClick={() => onAskConfirm("remove", item)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-500 transition hover:bg-red-500/10"
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <TrashIcon />
              </span>
              <span>Remove video</span>
            </button>
          )}

          {!canPublish && !canUnpublish && !canRemove && (
            <div className="px-4 py-3 text-sm text-[#8f8f8f]">
              No action available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EditVideoModal({
  item,
  form,
  loading,
  onChange,
  onCancel,
  onSave,
}: {
  item: Item;
  form: EditForm;
  loading: boolean;
  onChange: (field: keyof EditForm, value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-[#2f2f2f] bg-[#111827] p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Edit video metadata
            </h2>
            <p className="mt-1 text-xs text-[#8f8f8f]">
              Video ID: {item.id} • This edits metadata only
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full px-3 py-1.5 text-sm text-slate-200 transition hover:bg-gray-800 disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-xs text-[#aaaaaa]">Title</label>
            <input
              value={form.title}
              onChange={(e) => onChange("title", e.target.value)}
              className="w-full rounded-lg border border-[#2f2f2f] bg-gray-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
              placeholder="Video title"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#aaaaaa]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              className="min-h-[100px] w-full rounded-lg border border-[#2f2f2f] bg-gray-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
              placeholder="Video description"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[#aaaaaa]">Category</label>
              <input
                type="number"
                value={form.category}
                onChange={(e) => onChange("category", e.target.value)}
                className="w-full rounded-lg border border-[#2f2f2f] bg-gray-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                placeholder="1"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-[#aaaaaa]">Price</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => onChange("price", e.target.value)}
                className="w-full rounded-lg border border-[#2f2f2f] bg-gray-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                placeholder="100.50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-[#aaaaaa]">Premium</label>
              <select
                value={form.is_premium}
                onChange={(e) => onChange("is_premium", e.target.value)}
                className="w-full rounded-lg border border-[#2f2f2f] bg-gray-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-[#aaaaaa]">Currency ID</label>
              <input
                type="number"
                value={form.currency_id}
                onChange={(e) => onChange("currency_id", e.target.value)}
                className="w-full rounded-lg border border-[#2f2f2f] bg-gray-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                placeholder="3"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-[#3a3a3a] px-4 py-2 text-sm text-slate-200 transition hover:bg-gray-800 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={loading}
            className="rounded-lg bg-[#1f46c5] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoPlayerModal({
  item,
  onClose,
  onAskConfirm,
}: {
  item: Item;
  onClose: () => void;
  onAskConfirm: (action: ConfirmAction, item: Item) => void;
}) {
  const videoUrl = getPlayableUrl(item);

  const canPublish = item.type === "videos" || item.type === "private";
  const canUnpublish = item.type === "public";
  const canRemove = item.type !== "removed";

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-[#2f2f2f] bg-[#111827] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2a2a2a] px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-100">
              {item.title}
            </h2>
            <p className="mt-0.5 text-xs text-[#8f8f8f]">
              {item.visibility} • {item.status}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 rounded-full px-3 py-1.5 text-sm text-slate-200 transition hover:bg-gray-800"
          >
            Close
          </button>
        </div>

        <div className="bg-black">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              playsInline
              poster={item.thumbnail || undefined}
              className="h-auto max-h-[70vh] w-full bg-black"
            />
          ) : (
            <div className="flex min-h-[300px] items-center justify-center text-sm text-[#aaaaaa]">
              Video file not found.
            </div>
          )}
        </div>

        <div className="px-4 py-4">
          <div className="text-sm text-slate-300 line-clamp-2">
            {item.title}
          </div>

          <div className="mt-2 text-xs text-[#8f8f8f]">
            Views: {item.views} • Comments: {item.comments} • Video ID: {item.id}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {canPublish && (
              <button
                type="button"
                onClick={() => onAskConfirm("publish", item)}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500"
              >
                <PublishIcon />
                {item.type === "private" ? "Publish Publicly" : "Publish Video"}
              </button>
            )}

            {canUnpublish && (
              <button
                type="button"
                onClick={() => onAskConfirm("unpublish", item)}
                className="inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-500"
              >
                <VisibilityOffIcon />
                Unpublish Video
              </button>
            )}

            {canRemove && (
              <button
                type="button"
                onClick={() => onAskConfirm("remove", item)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
              >
                <TrashIcon />
                Remove Video
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmPopup({
  item,
  action,
  loading,
  onCancel,
  onProceed,
}: {
  item: Item;
  action: ConfirmAction;
  loading: boolean;
  onCancel: () => void;
  onProceed: () => void;
}) {
  const actionLabel =
    action === "publish" ? "publish" : action === "unpublish" ? "unpublish" : "remove";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#2f2f2f] bg-[#111827] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-100">
          Are you sure you want to proceed?
        </h2>

        <p className="mt-2 text-sm text-[#b8b8b8]">
          You are about to {actionLabel} this video:
        </p>

        <div className="mt-4 rounded-xl border border-[#2a2a2a] bg-gray-900 p-4">
          <div className="font-medium text-slate-200 line-clamp-2">
            {item.title}
          </div>
          <div className="mt-1 text-xs text-[#8f8f8f]">
            Video ID: {item.id}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-[#3a3a3a] px-4 py-2 text-sm text-slate-200 transition hover:bg-gray-800 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onProceed}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60 ${
              action === "publish"
                ? "bg-green-600 hover:bg-green-500"
                : action === "unpublish"
                ? "bg-yellow-600 hover:bg-yellow-500"
                : "bg-red-600 hover:bg-red-500"
            }`}
          >
            {loading ? "Processing..." : "Proceed"}
          </button>
        </div>
      </div>
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