import React, { useState, useEffect } from "react";
import { ThumbsUp, Share2, X, Link } from "lucide-react";
import { toast } from "react-toastify";
import { BsWhatsapp } from "react-icons/bs";
import { RiFacebookFill, RiTwitterXFill } from "react-icons/ri";
import api from "../api";

interface Props {
  title?: string;
  total?: string;
  totallike?: string;
  totaldislike?: string;
  onLike?: () => void;
  liked?: boolean;
  disliked?: boolean;
  videoTitle: string;
  channelName: string;
  followers?: string;
  periode: string;
  rate?: string;
  children: React.ReactNode;
  shareUrl?: string;
  ownerId?: number; // id of the user/channel to follow
}

const CardVideoPlay: React.FC<Props> = ({
  title,
  total,
  totallike,
  totaldislike,
  onLike,
  liked,
  disliked,
  videoTitle,
  channelName,
  followers,
  periode,
  rate,
  children,
  shareUrl,
  ownerId,
}) => {
  const [openShare, setOpenShare] = useState(false);
  const [startAt, setStartAt] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [dynamicFollowers, setDynamicFollowers] = useState<string | null>(null);

  const isLoggedIn = !!localStorage.getItem("token");

  // Fetch followers dynamically
  useEffect(() => {
    const fetchFollowers = async () => {
      if (!ownerId) return;

      if (!isLoggedIn) {
        setDynamicFollowers(followers || "0 followers");
        return;
      }

      try {
        const res = await api.post("/api/metadata/followers/count", { user_id: ownerId });
        setDynamicFollowers(`${res.data.data?.followers || 0} followers`);
      } catch {
        setDynamicFollowers(followers || "0 followers");
      }
    };
    fetchFollowers();
  }, [ownerId, followers, isLoggedIn]);

  // Video current timestamp
  const getCurrentTime = () => {
    const video = document.querySelector("video");
    return video ? Math.floor(video.currentTime) : 0;
  };

  const formatTimestamp = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h${m}m${s}s`;
    if (m > 0) return `${m}m${s}s`;
    return `${s}s`;
  };

  const buildShareUrl = () => {
    if (!shareUrl) return "";
    return startAt ? `${shareUrl}?t=${formatTimestamp(getCurrentTime())}` : shareUrl;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenShare(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(buildShareUrl());
    toast.success("Link copied to clipboard!");
  };

  // Follow button logic (only prompt login if not logged in)
  const handleFollow = async () => {
    if (!isLoggedIn) {
      toast.info("Login required to follow");
      return;
    }

    const userStr = localStorage.getItem("user");
    if (!userStr) return toast.error("Login required");

    let user;
    try {
      user = JSON.parse(userStr);
    } catch {
      toast.error("Invalid user data. Please login again.");
      localStorage.removeItem("user");
      return;
    }

    if (!user.user_id || !ownerId) {
      toast.error("Invalid follow request");
      return;
    }

    try {
      const res = await api.post("/api/metadata/following", {
        follower_id: user.user_id,
        following_id: ownerId,
      });

      if (res.data.success) {
        setIsFollowing(true);
        toast.success(res.data.message || "Following saved successfully");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to follow user";
      if (msg === "Already following this user") {
        setIsFollowing(true);
        toast.info("You are already following this user");
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-black shadow rounded-xl">
      {/* VIDEO PLAYER */}
      <div className="w-full rounded-xl overflow-hidden">{children}</div>

      {/* VIDEO TITLE */}
      <h2 className="text-2xl font-semibold mt-4 leading-tight text-black dark:text-white">
        {videoTitle}
      </h2>

      {/* VIEWS + DATE */}
      <div className="flex flex-wrap justify-between items-center mt-2 text-gray-600 dark:text-white">
        <p className="text-base">{total}</p>
        <p className="text-sm">{periode}</p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 mt-4 border-y py-3 text-gray-700 dark:text-white">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              if (!isLoggedIn) {
                toast.info("Login required to like");
                return;
              }
              onLike?.();
            }}
            className={`flex items-center ${
              liked ? "text-slate-300 dark:text-slate-300" : "hover:text-gray-500 dark:hover:text-slate-300"
            }`}
          >
            <ThumbsUp size={18} />
          </button>
          <p className="text-base">{totallike}</p>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 hover:text-gray-500 dark:hover:text-slate-300"
        >
          <Share2 size={18} /> Share
        </button>
      </div>

      {/* CHANNEL INFO */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{channelName}</h3>
          {(dynamicFollowers || followers) && (
            <p className="text-gray-500 text-sm">{dynamicFollowers || followers}</p>
          )}
          {!isLoggedIn && (
            <p className="text-xs text-gray-400 mt-1">Login to like, comment, or follow</p>
          )}
        </div>

        <button
          onClick={handleFollow}
          className={`px-4 py-2 rounded-lg font-semibold ${
            isFollowing
              ? "text-black dark:text-white bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
              : "text-white bg-green-950 hover:bg-green-900 dark:text-black dark:bg-yellow-300 dark:hover:bg-yellow-400"
          }`}
          disabled={isFollowing}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      {/* SHARE MODAL */}
      {openShare && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setOpenShare(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-white dark:bg-black p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share</h3>
              <button onClick={() => setOpenShare(false)}>
                <X />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center text-sm mb-4">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(buildShareUrl())}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <BsWhatsapp size={18} /> WhatsApp
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildShareUrl())}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <RiFacebookFill size={18} /> Facebook
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(buildShareUrl())}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <RiTwitterXFill size={18} /> X
              </a>

              <button onClick={copyLink} className="flex flex-col items-center gap-1">
                <Link size={18} /> Copy
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm mb-4">
              <input type="checkbox" checked={startAt} onChange={() => setStartAt(!startAt)} />
              Start at {formatTimestamp(getCurrentTime())}
            </label>

            <div className="flex gap-2">
              <input
                readOnly
                value={buildShareUrl()}
                className="flex-1 p-2 border rounded-md text-sm bg-transparent"
              />
              <button
                onClick={copyLink}
                className="px-3 py-2 rounded-md text-white bg-green-950 hover:bg-green-900 dark:text-black dark:bg-yellow-300 dark:hover:bg-yellow-400"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardVideoPlay;
