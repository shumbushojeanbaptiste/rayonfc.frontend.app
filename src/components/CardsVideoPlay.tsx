import React, { useState, useEffect } from "react";
import { ThumbsUp, Share2, X, Link } from "lucide-react";
import { toast } from "react-toastify";
import { BsWhatsapp } from "react-icons/bs";
import { RiFacebookFill, RiTwitterXFill } from "react-icons/ri";
import api from "../api";

interface Props {
  title?: string;
  total?: string;
  totallike?: number | string;
  totaldislike?: string;
  onLike?: () => void;
  liked?: boolean;
  disliked?: boolean;
  videoTitle: string;
  channelName: string;
  profileImage?: string;
  followers?: string;
  periode: string;
  rate?: string;
  children: React.ReactNode;
  shareUrl?: string;
  ownerId?: number;
  onChannelClick?: () => void;
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
  profileImage,
  followers,
  periode,
  rate,
  children,
  shareUrl,
  ownerId,
  onChannelClick,
}) => {
  const [openShare, setOpenShare] = useState(false);
  const [startAt, setStartAt] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [dynamicFollowers, setDynamicFollowers] = useState<string>(followers || "0 followers");
  const [likeAnimating, setLikeAnimating] = useState(false);
  

  const isLoggedIn = !!localStorage.getItem("token");

  // Fetch follow status
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!isLoggedIn || !ownerId) return;
      try {
        const res = await api.get(`/api/metadata/follow/status/${ownerId}`);
        setIsFollowing(!!res.data.data?.isFollowing);
      } catch {
        setIsFollowing(false);
      }
    };
    fetchFollowStatus();
  }, [ownerId, isLoggedIn]);

  // Fetch dynamic followers count
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
      if (isFollowing) {
        // Unfollow
        await api.delete("/api/metadata/unfollow", {
          data: { follower_id: user.user_id, following_id: ownerId },
        });
        setIsFollowing(false);
        //toast.success("Unfollowed successfully");

        // Update follower count
        setDynamicFollowers((prev) => {
          const num = parseInt(prev.split(" ")[0] || "0");
          return `${Math.max(0, num - 1)} followers`;
        });
      } else {
        // Follow
        const res = await api.post("/api/metadata/following", {
          follower_id: user.user_id,
          following_id: ownerId,
        });
        if (res.data.success) {
          setIsFollowing(true);
         // toast.success(res.data.message || "Following saved successfully");

          setDynamicFollowers((prev) => {
            const num = parseInt(prev.split(" ")[0] || "0");
            return `${num + 1} followers`;
          });
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Action failed";
      toast.error(msg);
    }
  };

  return (
    <div className="bg-white dark:bg-black shadow rounded-xl">
      <div className="w-full rounded-xl overflow-hidden">{children}</div>

      <h2 className="px-2 text-2xl font-semibold mt-4 leading-tight text-black dark:text-white">
        {videoTitle}
      </h2>

      <div className="px-2 flex flex-wrap justify-between items-center mt-2 text-gray-600 dark:text-white">
        <p className="text-base">{total}</p>
        <p className="text-sm">{periode}</p>
      </div>

      {/* Like & Share */}
      <div className="px-2 flex gap-4 mt-4 border-y py-3 text-gray-700 dark:text-white">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              if (!isLoggedIn) {
                toast.info("Login required to like");
                return;
              }
              if (!liked) {
                setLikeAnimating(true);
                setTimeout(() => setLikeAnimating(false), 400);
              }
              onLike?.(); // always call onLike for toggle
            }}
            className="relative flex items-center"
          >
            <ThumbsUp
              size={18}
              fill={liked ? "currentColor" : "none"}
              className={`transition-all duration-300 ${
                liked ? "text-slate-300" : ""
              } ${likeAnimating ? "scale-125 rotate-[-8deg]" : "scale-100"}`}
            />
            {likeAnimating && (
              <span className="absolute inset-0 rounded-full border-2 border-slate-300 animate-ping" />
            )}
          </button>
          <p className="text-base">{totallike?.toString() || 0}</p>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 hover:text-gray-500 dark:hover:text-slate-300"
        >
          <Share2 size={18} /> Share
        </button>
      </div>

      {/* Channel Info & Follow */}
      <div className="mt-4 px-2 flex items-center justify-between">
        <div className="flex items-center gap-3 mt-2">
         {/*
          <img
            src={profileImage || "/default-avatar.png"}
            alt={channelName}
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            onClick={(e) => {
                    e.stopPropagation();
                    onChannelClick?.();
                    }}
          />
        
          <div>
        
          <h3 
            className="text-lg font-semibold cursor-pointer"
            onClick={(e) => {
                  e.stopPropagation();
                  onChannelClick?.();
                  }}
            >
            {channelName}
          </h3>
          

          {dynamicFollowers && <p className="text-gray-500 text-sm">{dynamicFollowers}</p>}
          {!isLoggedIn && (
            <p className="text-xs text-gray-400 mt-1">Login to like, comment, or follow</p>
          )}
          </div>
         */}
         
        </div>
       
       {/*}
        <button
          onClick={handleFollow}
          className={`px-4 py-2 rounded-lg font-semibold ${
            isFollowing
              ? "text-black dark:text-black bg-gray-300 dark:bg-yellow-300 dark:hover:bg-yellow-400"
              : "text-white bg-green-950 hover:bg-green-900 dark:text-black dark:bg-yellow-300 dark:hover:bg-yellow-400"
          }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
        */}
      </div>

      {/* Share Modal */}
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
