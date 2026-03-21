import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import CardVideoPlay from "../../components/CardsVideoPlay";
import { decodeId, encodeId } from "../../utils/hashid";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLayoutEffect } from "react";

const Videosplay: React.FC = () => {
  const { hash } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const id = decodeId(hash as string);
  if (!id) { 
    navigate("/");
    return null;
  }

  
  const passedVideo = location.state;
  const source = passedVideo?.source || "all";

  const [video, setVideo] = useState<any>(passedVideo || null);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showMore, setShowMore] = useState(false);

  const [liked, setLiked] = useState(false);
  // ✅ Add disliked state
const [disliked, setDisliked] = useState(false);
// ✅ Add like count state for optimistic updates
const [likeCount, setLikeCount] = useState<number>(0);

  const recommendedRef = useRef<HTMLDivElement | null>(null);
const activeVideoRef = useRef<HTMLDivElement | null>(null);


  const ACCENT = "#05333a"; 

  const fileUrl = (path: string) => {
    if (!path || path === "null" || path === "undefined") return "/default-avatar.png";
    return path.includes("/") ? path : `${path}`;
  };
  const goToProfile = (ownerId: number | null) => {
  if (!ownerId) return;
  navigate(`/profile/${encodeId(ownerId)}`);
};


  const getVideoId = (v: any) => v?.video_id || v?.id || id;
  const getVideoUrl = (v: any) => v?.url || v?.video_url || v?.videoPath || "";
  const getOwnerName = (v: any) =>
    v?.first_name || v?.last_name
      ? `${v.first_name || ""} ${v.last_name || ""}`.trim()
      : v?.owner || v?.owner_name || "Unknown Owner";
  const getOwnerId = (v: any) => v?.user_id || v?.owner_id || v?.id || null;

  const forceScrollTop = () => {
    requestAnimationFrame(() => {
      try {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      } catch {
        window.scrollTo(0, 0);
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const sc = document.getElementById("app-scroll-container");
      if (sc) sc.scrollTop = 0;
    });
  };

  // ✅ Check token expiration on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/auth/signin");
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth/signin");
      }
    }
  }, []);

 // Initialize like count once video loads
useEffect(() => {
  if (video) {
    setLikeCount(video.likes || video.likes_count || 0);
  }
}, [video]);


useLayoutEffect(() => {
  const scrollToActive = () => {
    const isMobile = window.innerWidth < 1024; // only mobile
    if (isMobile && activeVideoRef.current && recommendedRef.current) {
      const container = recommendedRef.current;
      const active = activeVideoRef.current;

      const containerHeight = container.clientHeight;
      const activeOffsetTop = active.offsetTop;
      const activeHeight = active.clientHeight;

      // Center the active video
      const scrollTop = activeOffsetTop - containerHeight / 2 + activeHeight / 2;

      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    }
  };

  scrollToActive();

  window.addEventListener("resize", scrollToActive);
  return () => window.removeEventListener("resize", scrollToActive);
}, [video]); // ⚡ key change: depend on `video`, not `id`

// 👍 Like status (on load)
useEffect(() => {
  const fetchLikeStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token || !video) return;

    try {
      const res = await api.get(`/api/metadata/likes/status/${getVideoId(video)}`);
      const isLiked = !!res.data.data?.isLiked;

      setLiked(isLiked);
      setDisliked(!isLiked); // ✅ if not liked, treat as disliked
    } catch {
      setLiked(false);
      setDisliked(false); // safe default
    }
  };

  fetchLikeStatus();
}, [video]);



  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    forceScrollTop();

    const token = localStorage.getItem("token");

    // Load video
    if (passedVideo) {
      setVideo(passedVideo);
      if (token) api.put(`/api/videos/addView/${getVideoId(passedVideo)}`).catch(() => {});
    } else {
      api
        .get(`/api/videos/getOne/${id}`)
        .then((res) => {
          setVideo(res.data.data);
          if (token) api.put(`/api/videos/addView/${getVideoId(res.data.data)}`).catch(() => {});
        })
        .catch((err) => console.error("Failed to load video:", err));
    }

    // Load recommended videos
    api
      .get(`/api/videos/recommended/${id}`)
      .then((res) => setRecommended(res.data.data || []))
      .catch(() => setRecommended([]));

    // Load comments
    api
      .get(`/api/videos/comments/${id}`)
      .then((res) => setComments(res.data.data || []))
      .catch(() => setComments([]));

    setTimeout(forceScrollTop, 120);
  }, [id]);

  // 👍 Like video
  const likeVideo = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user.user_id) {
    toast.error("Login required");
    return;
  }

  const deviceId =
    localStorage.getItem("device_id") ||
    (() => {
      const id = crypto.randomUUID();
      localStorage.setItem("device_id", id);
      return id;
    })();

  try {
    if (!liked) {
      // 👍 LIKE
      await api.post("/api/watching/likes", {
        user_id: user.user_id,
        video_id: getVideoId(video),
        device_id: deviceId,
      });

      //toast.success("Liked");
      setLiked(true);
      setDisliked(false);
      setLikeCount((c) => c + 1); // ✅ increment like count
    } else {
      // 👎 CHANGE LIKE → DISLIKE
      await api.post("/api/watching/dislikes", {
        user_id: user.user_id,
        video_id: getVideoId(video),
        device_id: deviceId,
      });

      //toast.info("Changed to dislike");
      setLiked(false);
      setDisliked(true);
      setLikeCount((c) => Math.max(0, c - 1)); // ✅ decrement like count
    }
  } catch (err: any) {
    console.error("LIKE/DISLIKE ERROR:", err.response?.data);
    toast.error("Action failed");
  }
};


  // 💬 Submit comment
  const submitComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to comment.");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.user_id) {
      toast.error("You must be logged in to comment.");
      return;
    }

    try {
      await api.post("/api/videos/comments/add", {
        video_id: getVideoId(video),
        user_id: currentUser.user_id,
        comment: newComment,
      });

      toast.success("Comment posted successfully!");
      setNewComment("");

      const res = await api.get(`/api/videos/comments/${id}`);
      setComments(res.data.data || []);
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast.error("Failed to submit comment. Please try again.");
    }
  };

  // ▶ Auto-play next recommended video
  const handleEnded = () => {
    if (recommended.length === 0) return;

    forceScrollTop();
    navigate(`/watch/${encodeId(getVideoId(recommended[0]))}`, {
      state: recommended[0],
    });
  };

  if (!video) return <h2 className="p-6 text-xl text-black">Loading...</h2>;

  const ownerName = getOwnerName(video);
  const shareUrl = `${window.location.origin}/watch/${encodeId(getVideoId(video))}`;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
      />
      <div className="p-2 md:p-4 2xl:p-8">
      <div className="flex flex-col lg:flex-row gap-6 px-0 max-w-[1500px] mx-auto text-black dark:text-white bg-slate-100 dark:bg-black">
        <div className="flex-grow lg:w-[70%] xl:w-[75%]">
          <CardVideoPlay
            title="Views"
            total={`${video.views_count || video.views || 0} views`}
            totallike={`${likeCount}`} // ✅ dynamic like count
            totaldislike={`${video.dislikes || 0}`} // you can later track dislike count if needed
            onLike={likeVideo}
            liked={liked}
            channelName={ownerName}
            //profileImage={fileUrl(video.profile_photo || video.thumbnail )}
            videoTitle={video.title}
            periode={new Date(video.created_at).toDateString()} 
            rate=""
            shareUrl={shareUrl}
            ownerId={getOwnerId(video)} // ✅ Dynamic followers handled inside CardVideoPlay
            onChannelClick={() => goToProfile(getOwnerId(video))}
          >
            {/* VIDEO PLAYER */}
            <div className="w-full rounded-xl overflow-hidden shadow-lg bg-black">
              <video
                src={fileUrl(getVideoUrl(video))}
                controls
                autoPlay
                onEnded={handleEnded}
                style={{ width: "100%", height: "auto", maxHeight: "80vh", backgroundColor: "black" }}
                playsInline
                webkit-playsinline="true"
              />
            </div>

            {/* DESCRIPTION */}
            <div
              className="mt-4 p-4 rounded-xl shadow-sm bg-blue-50 dark:bg-black"
              style={{ borderTop: `0px solid ${ACCENT}` }}
            >
              <p
                className={`text-gray-800 dark:text-slate-100 whitespace-pre-line transition-all duration-300 ${
                  showMore ? "" : "line-clamp-3"
                }`}
              >
                {video.description || "No description available."}
              </p>

              {video.description && video.description.length > 120 && (
                <button
                  className="mt-3 px-4 py-2 rounded-lg text-white dark:text-slate-300 bg-slate-100 dark:bg-black font-semibold"
                  onClick={() => setShowMore(!showMore)}
                >
                  {showMore ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          </CardVideoPlay>

          {/* Comments Section */}
          {/*
          <div
            className="mt-10 p-6 rounded-xl shadow-sm bg-slate-100 dark:bg-black"
            style={{ borderTop: `4px solid ${ACCENT}` }}
          >
            <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">Comments ({comments.length})</h3>
            <div className="flex items-center gap-3 mb-6">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border p-3 rounded-lg focus:outline-none text-black dark:text-white bg-slate-100 dark:bg-black"
                placeholder="Add a comment..."
              />
              <button
                onClick={submitComment}
                className="px-4 py-2 rounded-lg text-white bg-green-950 hover:bg-green-900 dark:text-black dark:bg-yellow-300 dark:hover:bg-yellow-400 font-semibold"
              >
                Send
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {comments.map((c) => (
                <div
                  key={c.comment_id}
                  className="flex gap-3 p-4 rounded-lg text-black dark:text-white bg-slate-100 dark:bg-black"
                  style={{ borderLeft: `4px solid ${ACCENT}` }}
                >
                  <img
                    src="/default-avatar.png"
                    className="w-12 h-12 rounded-full object-cover bg-gray-300"
                    alt="user"
                  />
                  <div>
                    <p className="font-semibold text-black dark:text-white">
                      {c.first_name} {c.last_name}
                      <span className="text-gray-600 dark:text-slate-100 text-sm ml-2">
                        {new Date(c.created_at).toDateString()}
                      </span>
                    </p>
                    <p className="mt-1 text-black dark:text-white">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          */}
        </div>

        {/* RECOMMENDED VIDEOS */}
          <aside
           ref={recommendedRef}
           className="w-full lg:w-[28%] xl:w-[25%] lg:sticky lg:top-4 h-[calc(100vh-2rem)] overflow-y-auto scroll-hover"
           >


          <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">Up next</h3>
          <div className="flex flex-col gap-4">
            {recommended.map((r: any) => (
              <div
  key={getVideoId(r)}
  ref={getVideoId(r) === getVideoId(video) ? activeVideoRef : null}
  className={`upnext-card group flex gap-3 cursor-pointer p-2 rounded-md
    ${getVideoId(r) === getVideoId(video) ? "upnext-active" : ""}
  `}
  onClick={() => {
    forceScrollTop();
    navigate(`/watch/${encodeId(getVideoId(r))}`, { state: r });
    setTimeout(() => {
    activeVideoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 100); // small delay to wait for render
  }}
>

  {/* Thumbnail */}
  <div className="relative w-36 h-20 overflow-hidden rounded-md">
    <img
      src={fileUrl(r.thumbnail)}
      alt={r.title}
      className="upnext-thumb w-full h-full object-cover"
    />

    {/* Overlay */}
    <div className="upnext-overlay absolute inset-0 bg-black/30 flex items-center justify-center">
      <svg
        className="upnext-play w-8 h-8 text-white"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  </div>

  {/* Text */}
  <div className="flex-1">
    <h4 className="font-medium line-clamp-2 text-black dark:text-white">
      {r.title}
    </h4>
    <p className="text-sm text-gray-600 dark:text-slate-200">
      {r.first_name || r.owner || ""} {r.last_name || ""}
    </p>
    <p className="text-sm text-gray-600 dark:text-slate-200">
      {r.views_count || r.views || 0} views
    </p>
  </div>
</div>

            ))}
          </div>
        </aside>
      </div>
      </div>
    </>
  );
};

export default Videosplay;
