import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import CardVideoPlay from "../../components/CardsVideoPlay";
import { decodeId, encodeId } from "../../utils/hashid";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Videosplaysample: React.FC = () => {
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

  // 🔹 State to disable like/dislike after click
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const ACCENT = "#05333a";

  const fileUrl = (path: string) => {
    if (!path || path === "null" || path === "undefined") {
      return "/default-avatar.png";
    }
    if (!path.includes("/")) {
      path = `${path}`;
    }
    return path;
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
          ? `/api/videos/recommended/${id}`
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

  // 🔹 LIKE FUNCTION
  const likeVideo = async () => {
    if (liked || disliked) return; // disable if already clicked

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
      await api.post("/api/watching/likes", {
        user_id: user.user_id,
        video_id: getVideoId(video),
        device_id: deviceId,
      });

      toast.success("Liked");
      setLiked(true);
      setDisliked(true); // disable dislike as well
    } catch (err: any) {
      console.error("LIKE ERROR:", err.response?.data);
      if (err.response?.data?.message === "Already liked this video.") {
        toast.info("You already liked this video");
      } else {
        toast.error("Failed to like video");
      }
      setLiked(true);
      setDisliked(true);
    }
  };

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
    navigate(`home/watch/${encodeId(getVideoId(recommended[0]))}`, {
      state: recommended[0],
    });
  };

  if (!video) return <h2 className="p-6 text-xl text-black">Loading...</h2>;

  const ownerName = getOwnerName(video);
  const shareUrl = `${window.location.origin}home/watch/${encodeId(getVideoId(video))}`;

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
      <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-[1500px] mx-auto text-black dark:text-white bg-slate-100 dark:bg-black">
        <div className="flex-grow lg:w-[70%] xl:w-[75%]">
          <CardVideoPlay
            title="Views"
            total={`${video.views_count || video.views || 0} views`}
            totallike={`${video.likes || 0}`}
            totaldislike={`${video.dislikes || 0}`}
            onLike={likeVideo}
            channelName={ownerName}
            videoTitle={video.title}
            periode={new Date(video.created_at).toDateString()}
            rate=""
            shareUrl={shareUrl}
            liked={liked} // 🔹 pass like/dislike state
            ownerId={getOwnerId(video)} // ✅ Dynamic followers handled inside CardVideoPlay
          >
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

            <div
              className="mt-4 p-4 rounded-xl shadow-sm bg-slate-100 dark:bg-black"
              style={{ borderTop: `4px solid ${ACCENT}` }}
            >
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-slate-100">{ownerName}</h3>
              <p
                className={`text-gray-800 dark:text-slate-100 whitespace-pre-line transition-all duration-300 ${
                  showMore ? "" : "line-clamp-3"
                }`}
              >
                {video.description || "No description available."}
              </p>

              {video.description && video.description.length > 120 && (
                <button
                  className="mt-3 px-4 py-2 rounded-lg text-white dark:text-gray-800 bg-slate-100 dark:bg-black font-semibold"
                  onClick={() => setShowMore(!showMore)}
                >
                  {showMore ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          </CardVideoPlay>

          {/* Comments & channel section unchanged */}
          <div
            className="mt-6 p-4 shadow-sm rounded-xl flex items-center gap-4 bg-slate-100 dark:bg-black"
            style={{ borderLeft: `6px solid ${ACCENT}` }}
          >
            <img
              src="/default-avatar.png"
              className="w-16 h-16 rounded-full object-cover bg-gray-300"
              alt="channel"
            />
            <div>
              <h3 className="text-lg font-semibold text-black dark:text-white">{ownerName}</h3>
              <p className="text-gray-700 dark:text-white text-sm">120k followers</p>
            </div>
          </div>

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
        </div>

        <aside className="w-full lg:w-[28%] xl:w-[25%]">
          <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">Up next</h3>
          <div className="flex flex-col gap-4">
            {recommended.map((r: any) => (
              <div
                key={getVideoId(r)}
                className="flex gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-50 dark:hover:bg-black"
                onClick={() => {
                  forceScrollTop();
                  navigate(`/home/watch/${encodeId(getVideoId(r))}`, { state: r });
                }}
              >
                <img src={fileUrl(r.thumbnail)} alt={r.title} className="w-36 h-20 object-cover rounded-md" />
                <div className="flex-1">
                  <h4 className="font-medium line-clamp-2 text-black dark:text-white">{r.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-200">{r.first_name || r.owner || ""} {r.last_name || ""}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-200">{r.views_count || r.views || 0} views</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
};

export default Videosplaysample;
 