import React, { useEffect, useRef, useState } from "react";
import { ThumbsUp, Share2, X, Link } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { RiFacebookFill, RiTwitterXFill } from "react-icons/ri";
import { toast } from "react-toastify";
import api from "../../api";
import { Volume2, VolumeX } from "lucide-react";
import { Check, Plus, Play, Pause, Heart } from "lucide-react";

interface ShortVideo {
  id: number;
  title: string;
  video_url: string;
  owner: string;
  user_id?: number;
  likes?: number;
}

interface Props {
  open: boolean;
  shorts: ShortVideo[];
  activeIndex: number;
  onClose: () => void;
}

const ANIMATION_DURATION = 500;
const SWIPE_THRESHOLD = 50;

const ShortsViewerModal: React.FC<Props> = ({
  open,
  shorts,
  activeIndex,
  onClose,
}) => {
  const [index, setIndex] = useState(activeIndex);
  const [muted, setMuted] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const [openShare, setOpenShare] = useState(false);
  const [startAt, setStartAt] = useState(false);

  /* ===== ADDITIONS START ===== */
  const [isPlaying, setIsPlaying] = useState(true);

  type FloatingHeart = { id: number; x: number; y: number };
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  /* ===== ADDITIONS END ===== */

  const touchStartY = useRef(0);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const isLoggedIn = !!localStorage.getItem("token");

  const currentVideo = shorts[index];

  // ---------- helpers ----------
  const getDeviceId = () => {
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("device_id", id);
    }
    return id;
  };

  /* ===== ADDITIONS START ===== */
  const togglePlay = () => {
    const v = videoRefs.current[index];
    if (!v) return;

    if (v.paused) {
      v.play().catch(() => {});
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const spawnHeart = (x: number, y: number) => {
    const id = Date.now();
    setHearts((p) => [...p, { id, x, y }]);
    setTimeout(() => {
      setHearts((p) => p.filter((h) => h.id !== id));
    }, 800);
  };

  const handleVideoTap = (
    e: React.MouseEvent | React.TouchEvent
  ) => {
    const point =
      "touches" in e
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };

    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
      tapTimeout.current = null;
      spawnHeart(point.x, point.y);
      handleLike();
    } else {
      tapTimeout.current = setTimeout(() => {
        togglePlay();
        tapTimeout.current = null;
      }, 250);
    }
  };
  /* ===== ADDITIONS END ===== */

  // ---------- sync active index ----------
  useEffect(() => {
    setIndex(activeIndex);
  }, [activeIndex]);

  // ---------- load metadata per video ----------
  useEffect(() => {
    if (!currentVideo) return;

    setLiked(false);
    setIsFollowing(false);
    setLikeCount(currentVideo.likes || 0);
    setFollowerCount(0);

    const fetchStatus = async () => {
      try {
        if (isLoggedIn) {
          const resLike = await api.get(
            `/api/metadata/likes/status/${currentVideo.id}`
          );
          setLiked(!!resLike.data.data?.isLiked);

          if (currentVideo.user_id) {
            const resFollow = await api.get(
              `/api/metadata/follow/status/${currentVideo.user_id}`
            );
            setIsFollowing(!!resFollow.data.data?.isFollowing);
          }
        }

        if (currentVideo.user_id) {
          const resFollowers = await api.post(
            "/api/metadata/followers/count",
            { user_id: currentVideo.user_id }
          );
          setFollowerCount(resFollowers.data.data?.followers || 0);
        }
      } catch {
        setLiked(false);
        setIsFollowing(false);
      }
    };

    fetchStatus();
  }, [index, currentVideo, isLoggedIn]);

  // ---------- navigation ----------
  const clampIndex = (i: number) =>
    Math.max(0, Math.min(i, shorts.length - 1));

  const snapTo = (next: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIndex(clampIndex(next));
    setProgress(0);
    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION);
  };

  const goNext = () => snapTo(index + 1);
  const goPrev = () => snapTo(index - 1);

  useEffect(() => {
    if (!open) return;
    const onWheel = (e: WheelEvent) => {
      if (isAnimating || Math.abs(e.deltaY) < 20) return;
      e.preventDefault();
      e.deltaY > 0 ? goNext() : goPrev();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [open, isAnimating, index]);

  // touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (isAnimating) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    delta > 0 ? goNext() : goPrev();
  };

  // autoplay
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        v.play().catch(() => {});
        setIsPlaying(true);
      } else {
        v.pause();
      }
    });
  }, [index]);

  // ---------- like ----------
  const handleLike = async () => {
    if (!isLoggedIn) return toast.info("Login required to like");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.user_id) return toast.error("Login required");

    try {
      if (!liked) {
        await api.post("/api/watching/likes", {
          user_id: user.user_id,
          video_id: currentVideo.id,
          device_id: getDeviceId(),
        });
        setLiked(true);
        setLikeCount((c) => c + 1);
      } else {
        await api.post("/api/watching/dislikes", {
          user_id: user.user_id,
          video_id: currentVideo.id,
          device_id: getDeviceId(),
        });
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      }
    } catch {
      toast.error("Action failed");
    }
  };

  // ---------- follow ----------
  const handleFollow = async () => {
    if (!isLoggedIn) return toast.info("Login required to follow");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.user_id || !currentVideo.user_id)
      return toast.error("Invalid request");

    try {
      if (isFollowing) {
        await api.delete("/api/metadata/unfollow", {
          data: {
            follower_id: user.user_id,
            following_id: currentVideo.user_id,
          },
        });
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      } else {
        await api.post("/api/metadata/following", {
          follower_id: user.user_id,
          following_id: currentVideo.user_id,
        });
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    } catch {
      toast.error("Action failed");
    }
  };

  // ---------- share helpers ----------
  const getCurrentTime = () => {
    const v = videoRefs.current[index];
    return v ? Math.floor(v.currentTime) : 0;
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
    const url = `${window.location.href}?video=${currentVideo.id}`;
    return startAt ? `${url}&t=${formatTimestamp(getCurrentTime())}` : url;
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(buildShareUrl());
    toast.success("Link copied to clipboard!");
  };

  if (!open || !shorts.length) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black overflow-hidden touch-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl z-50"
      >
        <X />
      </button>

      <div
        className="h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateY(-${index * 100}vh)` }}
      >
        {shorts.map((short, i) => (
          <div
            key={short.id}
            className="h-screen w-full relative flex items-center justify-center"
          >
            <div className="relative h-[90vh] aspect-[9/16] max-w-[420px] w-full bg-black rounded-xl overflow-hidden shadow-xl">
              <video
                ref={(el) => (videoRefs.current[i] = el!)}
                src={short.video_url}
                className="w-full h-full object-cover"
                autoPlay
                muted={muted}
                loop
                playsInline
                onClick={handleVideoTap}
                onTouchStart={handleVideoTap}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  setProgress((v.currentTime / v.duration) * 100);
                }}
              />

              {!isPlaying && i === index && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-fade-in">
                  <div className="bg-black/50 rounded-full p-6">
                    <Play size={48} className="text-white" />
                  </div>
                </div>
              )}

              {hearts.map((heart) => (
                <div
                  key={heart.id}
                  className="absolute z-30 pointer-events-none animate-float-heart"
                  style={{
                    left: heart.x,
                    top: heart.y,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Heart size={48} fill="red" className="text-red-500" />
                </div>
              ))}

              <button
                onClick={() => setMuted((m) => !m)}
                className="absolute top-3 left-3 text-white bg-black/40 rounded-full p-2 z-20"
              >
                {muted ? <VolumeX /> : <Volume2 />}
              </button>

              <div className="absolute bottom-32 left-3 right-3 text-white z-20">
                <p className="font-semibold flex items-center gap-2">
                  @{short.owner}
                  <span className="text-blue-400">✔</span>
                </p>
                <p className="text-xs text-white/80">
                  {followerCount} followers
                </p>
                <p className="text-sm line-clamp-2 mt-1">{short.title}</p>
              </div>

              {i === index && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            <div className="absolute right-6 bottom-24 flex flex-col items-center gap-6 text-white">
              <button
                onClick={handleLike}
                className="flex flex-col items-center"
              >
                <ThumbsUp
                  size={24}
                  fill={liked ? "currentColor" : "none"}
                />
                <span className="text-xs mt-1">{likeCount}</span>
              </button>

              <button
                onClick={handleFollow}
                className="flex flex-col items-center"
              >
                {isFollowing ? <Check /> : <Plus />}
                <span className="text-xs mt-1">
                  {isFollowing ? "Following" : "Follow"}
                </span>
              </button>

              <button
                onClick={() => setOpenShare(true)}
                className="flex flex-col items-center"
              >
                <Share2 size={24} />
                <span className="text-xs mt-1">Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {openShare && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setOpenShare(false)}
        >
          <div
            className="bg-white dark:bg-black w-full max-w-md rounded-xl p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Share</h3>
              <button onClick={() => setOpenShare(false)}>
                <X />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center mb-4">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  buildShareUrl()
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <BsWhatsapp size={18} /> WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  buildShareUrl()
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <RiFacebookFill size={18} /> Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  buildShareUrl()
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <RiTwitterXFill size={18} /> X
              </a>
              <button
                onClick={copyLink}
                className="flex flex-col items-center gap-1"
              >
                <Link size={18} /> Copy
              </button>
            </div>

            <label className="flex items-center gap-2 mb-4 text-sm">
              <input
                type="checkbox"
                checked={startAt}
                onChange={() => setStartAt(!startAt)}
              />
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
                className="px-3 py-2 rounded-md text-white bg-green-950 hover:bg-green-900 dark:text-black dark:bg-yellow-300"
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

export default ShortsViewerModal;
