import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import BuyVideoModal from "../components/SubscribePlanModal";
import { getAuthUser } from "../utils/auth";
import { Video } from "../types/videouser";
import { encodeId } from "../utils/hashid";

const CATEGORY_ID = 1;

const Interview: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [checkingAccessId, setCheckingAccessId] = useState<number | null>(null);

  const navigate = useNavigate();
  const user = getAuthUser();

  useEffect(() => {
    setLoadingVideos(true);

    api
      .post("/api/videos/by_category", {
        category_id: CATEGORY_ID,
      })
      .then((res) => setVideos(res.data?.data || []))
      .catch((err) => console.error("FAILED TO LOAD VIDEOS:", err))
      .finally(() => setLoadingVideos(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setWalletBalance(0);
      return;
    }

    api
      .get(`/api/payments/balance/${user.user_id}`)
      .then((res) => setWalletBalance(Number(res.data?.data?.balance || 0)))
      .catch(() => setWalletBalance(0));
  }, [user]);

  const fileUrl = (path?: string) =>
    path && path !== "null" && path !== "undefined"
      ? path
      : "/default-avatar.png";

  const getChannelName = (video: Video) => {
    if (video.owner) return video.owner;

    const fullName = `${video.first_name ?? ""} ${video.last_name ?? ""}`.trim();
    if (fullName) return fullName;

    return "Unknown Artist";
  };

  const handleVideoClick = async (video: Video) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (!video.price || Number(video.price) === 0) {
      navigate(`/watch/${encodeId(video.id)}`, {
        state: { ...video, source: "Interview" },
      });
      return;
    }

    if (checkingAccessId === video.id) return;
    setCheckingAccessId(video.id);

    try {
      const res = await api.get(`/api/videos/${video.id}/has-access`);
      const hasAccess =
        res?.data?.data?.hasAccess ?? res?.data?.hasAccess ?? false;

      if (hasAccess) {
        navigate(`/watch/${encodeId(video.id)}`, {
          state: { ...video, source: "Interview" },
        });
      } else {
        setSelectedVideo(video);
      }
    } catch (err) {
      console.warn("ACCESS CHECK FAILED:", err);
      setSelectedVideo(video);
    } finally {
      setCheckingAccessId(null);
    }
  };

  const refreshWallet = () => {
    if (!user) return;

    api
      .get(`/api/payments/balance/${user.user_id}`)
      .then((res) => setWalletBalance(Number(res.data?.data?.balance || 0)))
      .catch(() => setWalletBalance(0));
  };

  const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="aspect-video w-full rounded-xl bg-zinc-800" />
      <div className="mt-3 h-4 w-4/5 rounded bg-zinc-800" />
      <div className="mt-2 h-3 w-2/5 rounded bg-zinc-800" />
    </div>
  );

  return (
    <>
      <Breadcrumb pageName="" />

      <section className="w-full text-white px-4 sm:px-8 lg:px-12 py-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Interview
          </h2>
        </div>

        {loadingVideos ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() =>
                  navigate(`/watch/${encodeId(video.id)}`, { state: video })
                }
                className="group cursor-pointer"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 shadow-lg">
                  <img
                    src={fileUrl(video.thumbnail)}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[11px] text-white">
                    {video.duration || "--"}
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-white">
                    {video.title || "Untitled Video"}
                  </h3>

                  {/*<p className="mt-1 line-clamp-1 text-xs text-gray-300">
                    {getChannelName(video)}
                  </p>*/}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-sm text-slate-400">
            No interview videos available.
          </div>
        )}

        {/*{selectedVideo && (
          <BuyVideoModal
            video={selectedVideo}
            walletBalance={walletBalance}
            onClose={() => setSelectedVideo(null)}
            onSuccess={() => {
              setSelectedVideo(null);
              refreshWallet();
            }}
          />
        )}*/}
      </section>
    </>
  );
};

export default Interview;