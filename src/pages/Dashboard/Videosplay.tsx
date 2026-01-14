import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import CardVideoPlay from "../../components/CardsVideoPlay";
import { decodeId, encodeId } from "../../utils/hashid";
import { toast, ToastContainer } from "react-toastify"; // ✅ Toastify
import "react-toastify/dist/ReactToastify.css"; // ✅ Toastify CSS

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

  // ✅ Free preview states
  const [previewEnded, setPreviewEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const ACCENT = "#05333a";

  const fileUrl = (path: string) => {
    if (!path || path === "null" || path === "undefined") {
      return "/default-avatar.png";
    }
    if (!path.includes("/")) path = `${path}`;
    return path;
  };

  const getVideoId = (v: any) => v?.video_id || v?.id || id;
  const getVideoUrl = (v: any) => v?.url || v?.video_url || v?.videoPath || "";
  const getOwnerName = (v: any) =>
    v?.first_name || v?.last_name
      ? `${v.first_name || ""} ${v.last_name || ""}`.trim()
      : v?.owner || "Unknown Owner";

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

  // ✅ Token expiration check on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/auth/signin");
          return;
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth/signin");
        return;
      }
    }
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    forceScrollTop();

    const token = localStorage.getItem("token");

    if (passedVideo) {
      setVideo(passedVideo);
      if (token) {
        api.put(`/api/videos/addView/${getVideoId(passedVideo)}`).catch(() => {});
      }
    } else {
      api
        .get(`/api/videos/getOne/${id}`)
        .then((res) => {
          setVideo(res.data.data);
          if (token) {
            api.put(`/api/videos/addView/${getVideoId(res.data.data)}`).catch(() => {});
          }
        })
        .catch((err) => console.error("Failed to load video:", err));
    }

    api
      .get(
        source === "trending"
          ? `/api/videos/trends/recommended/${id}`
          : `/api/videos/recommended/${id}`
      )
      .then((res) => setRecommended(res.data.data || []))
      .catch(() => setRecommended([]));

    api
      .get(`/api/videos/comments/${id}`)
      .then((res) => setComments(res.data.data || []))
      .catch(() => setComments([]));

    setTimeout(forceScrollTop, 120);
  }, [id]);

  // ✅ Free preview timer
  useEffect(() => {
    if (videoRef.current) {
      const timer = setTimeout(() => {
        videoRef.current?.pause();
        setPreviewEnded(true);
        toast.info("Your free preview has ended. Please purchase to continue watching.");
      }, 5000); // 5 seconds free preview

      return () => clearTimeout(timer);
    }
  }, [video]);

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

  const handleEnded = () => {
    if (recommended.length === 0) return;

    forceScrollTop();
    navigate(`/watch/${encodeId(getVideoId(recommended[0]))}`, {
      state: recommended[0],
    });
  };

  if (!video)
    return <h2 className="p-6 text-xl text-black">Loading...</h2>;

  const ownerName = getOwnerName(video);

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
      <div
        className="flex flex-col lg:flex-row gap-6 p-4 max-w-[1500px] mx-auto"
        style={{ background: "white", color: "black" }}
      >
        {/* LEFT SIDE */}
        <div className="flex-grow lg:w-[70%] xl:w-[75%]">
          <CardVideoPlay
            title="Views"
            total={`${video.views_count || video.views || 0} views`}
            channelName={ownerName}
            followers="120k"
            videoTitle={video.title}
            periode={new Date(video.created_at).toDateString()}
            rate=""
          >
            {/* PLAYER */}
            <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-black">
              <video
                ref={videoRef}
                src={fileUrl(getVideoUrl(video))}
                controls
                autoPlay
                onEnded={handleEnded}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "80vh",
                  backgroundColor: "black",
                }}
                playsInline
                webkit-playsinline="true"
              />

              {/* ✅ Free preview overlay */}
              {previewEnded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white text-center p-4">
                  <p className="mb-4">Your free preview has ended.</p>
                  <button
                    className="px-4 py-2 bg-green-600 rounded"
                    onClick={() => navigate("/studio?deposit=true")}
                  >
                    Buy to Continue
                  </button>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div
              className="mt-4 p-4 rounded-xl shadow-sm"
              style={{ background: "white", borderTop: `4px solid ${ACCENT}` }}
            >
              <h3 className="text-lg font-semibold mb-2 text-black">
                {ownerName}
              </h3>
              <p
                className={`text-gray-800 whitespace-pre-line transition-all duration-300 ${
                  showMore ? "" : "line-clamp-3"
                }`}
              >
                {video.description || "No description available."}
              </p>

              {video.description && video.description.length > 120 && (
                <button
                  className="mt-3 px-4 py-2 rounded-lg text-white font-semibold"
                  style={{ background: ACCENT }}
                  onClick={() => setShowMore(!showMore)}
                >
                  {showMore ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          </CardVideoPlay>

          {/* CHANNEL */}
          <div
            className="mt-6 p-4 shadow-sm rounded-xl flex items-center gap-4"
            style={{ background: "white", borderLeft: `6px solid ${ACCENT}` }}
          >
            <img
              src="/default-avatar.png"
              className="w-16 h-16 rounded-full object-cover bg-gray-300"
              alt="channel"
            />
            <div>
              <h3 className="text-lg font-semibold text-black">{ownerName}</h3>
              <p className="text-gray-700 text-sm">120k followers</p>
            </div>
          </div>

          {/* COMMENTS */}
          <div
            className="mt-10 p-6 rounded-xl shadow-sm"
            style={{ background: "white", borderTop: `4px solid ${ACCENT}` }}
          >
            <h3 className="text-xl font-semibold mb-4 text-black">
              Comments ({comments.length})
            </h3>

            <div className="flex items-center gap-3 mb-6">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border p-3 rounded-lg focus:outline-none"
                style={{ borderColor: ACCENT }}
                placeholder="Add a comment..."
              />
              <button
                onClick={submitComment}
                className="px-4 py-2 rounded-lg text-white font-semibold"
                style={{ background: ACCENT }}
              >
                Send
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {comments.map((c) => (
                <div
                  key={c.comment_id}
                  className="flex gap-3 p-4 rounded-lg"
                  style={{
                    background: "#f8f8f8",
                    borderLeft: `4px solid ${ACCENT}`,
                  }}
                >
                  <img
                    src="/default-avatar.png"
                    className="w-12 h-12 rounded-full object-cover bg-gray-300"
                    alt="user"
                  />
                  <div>
                    <p className="font-semibold text-black">
                      {c.first_name} {c.last_name}
                      <span className="text-gray-600 text-sm ml-2">
                        {new Date(c.created_at).toDateString()}
                      </span>
                    </p>
                    <p className="mt-1 text-black">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <aside className="w-full lg:w-[28%] xl:w-[25%]">
          <h3 className="text-xl font-semibold mb-4 text-black">Up next</h3>

          <div className="flex flex-col gap-4">
            {recommended.map((r: any) => (
              <div
                key={getVideoId(r)}
                className="flex gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-50"
                onClick={() => {
                  forceScrollTop();
                  navigate(`/watch/${encodeId(getVideoId(r))}`, { state: r });
                }}
              >
                <img
                  src={fileUrl(r.thumbnail)}
                  alt={r.title}
                  className="w-36 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h4 className="font-medium line-clamp-2 text-black">
                    {r.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {r.first_name || r.owner || ""} {r.last_name || ""}
                  </p>
                  <p className="text-sm text-gray-600">
                    {r.views_count || r.views || 0} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
};

export default Videosplay;
