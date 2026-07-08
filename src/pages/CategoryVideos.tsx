import React, { useEffect, useState } from "react";
import { Lock, Play, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import BuyVideoModal from "../components/SubscribePlanModal";
import { getAuthUser } from "../utils/auth";
import { Video } from "../types/videouser";
import { encodeId } from "../utils/hashid";

type CategoryVideosProps = {
  categoryId: number;
  title: string;
};

const CategoryVideos: React.FC<CategoryVideosProps> = ({ categoryId, title }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [checkingAccessId, setCheckingAccessId] = useState<number | null>(null);

  const navigate = useNavigate();

  const fileUrl = (path?: string) =>
    path && path !== "null" && path !== "undefined"
      ? path.startsWith("http")
        ? path
        : `${api.defaults.baseURL}${path.startsWith("/") ? path : `/${path}`}`
      : "/default-avatar.png";

  useEffect(() => {
    if (!categoryId) return;

    setLoadingVideos(true);

    api
      .post("/api/videos/by_category", {
        category_id: categoryId,
      })
      .then((res) => {
        setVideos(res.data?.data || []);
      })
      .catch((err) => {
        console.error(`FAILED TO LOAD ${title} VIDEOS:`, err);
      })
      .finally(() => {
        setLoadingVideos(false);
      });
  }, [categoryId, title]);

  useEffect(() => {
    const user = getAuthUser();

    if (!user?.user_id) return;

    api
      .get(`/api/payments/balance/${user.user_id}`)
      .then((res) => {
        setWalletBalance(Number(res.data?.data?.balance || 0));
      })
      .catch((err) => {
        console.error("FAILED TO LOAD WALLET BALANCE:", err);
      });
  }, []);

  const handleVideoClick = async (video: Video) => {
    const price = Number(video.price || 0);

    if (price <= 0) {
      navigate(`/watch/${encodeId(video.id)}`, {
        state: { ...video, source: title },
      });
      return;
    }

    try {
      setCheckingAccessId(video.id);

      const res = await api.get(`/api/videos/${video.id}/has-access`);
      const hasAccess = res.data?.hasAccess;

      if (hasAccess) {
        navigate(`/watch/${encodeId(video.id)}`, {
          state: { ...video, source: title },
        });
      } else {
        setSelectedVideo(video);
      }
    } catch (err) {
      console.error("FAILED TO CHECK VIDEO ACCESS:", err);
      setSelectedVideo(video);
    } finally {
      setCheckingAccessId(null);
    }
  };

  return (
    <section className="relative w-full px-3 sm:px-5 lg:px-6">
      {/*<div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        <div className="mt-2 h-[3px] w-14 rounded-full bg-blue-600" />
      </div>*/}

      {loadingVideos ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item}>
              <div className="aspect-video animate-pulse rounded-xl bg-slate-800" />
              <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-slate-800" />
              <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-slate-800" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-lg">
          <p className="text-sm font-medium text-slate-300">
            No videos found in {title}.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Videos added to this category will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => {
            const price = Number(video.price || 0);
            const isPaid = price > 0;
            const isChecking = checkingAccessId === video.id;

            return (
              <button
                key={video.id}
                type="button"
                onClick={() => handleVideoClick(video)}
                disabled={isChecking}
                className="group w-full text-left outline-none"
              >
                <div className="w-full">
                  <div className="relative aspect-video w-full overflow-hidden rounded-md bg-slate-800">
                    <img
                      src={fileUrl(video.thumbnail)}
                      alt={video.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/*<div className="absolute left-3 top-3">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 rounded bg-yellow-400 px-2 py-1 text-[11px] font-bold text-black">
                          <Crown size={12} />
                          Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded bg-emerald-500 px-2 py-1 text-[11px] font-bold text-white">
                          Free
                        </span>
                      )}
                    </div>*/}

                    {video.duration && (
                      <span className="absolute bottom-2 right-2 rounded bg-black/85 px-2 py-1 text-[11px] font-semibold text-white">
                        {video.duration}
                      </span>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-xl">
                        {isPaid ? (
                          <Lock size={20} />
                        ) : (
                          <Play size={22} fill="currentColor" />
                        )}
                      </span>
                    </div>

                    {isChecking && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm font-medium text-white">
                        Checking access...
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-semibold leading-snug text-white">
                      {video.title}
                    </h3>

                    <div className="mt-1 text-sm text-slate-400">
                      {video.views || 0} views
                    </div>

                    {/*<div className="mt-1 text-sm">
                      {isPaid ? (
                        <span className="font-semibold text-yellow-400">
                          {price.toLocaleString()} RWF
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-400">
                          Free
                        </span>
                      )}
                    </div>*/}

                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/*{selectedVideo && (
        <BuyVideoModal
          video={selectedVideo}
          walletBalance={walletBalance}
          onClose={() => setSelectedVideo(null)}
        />
      )}*/}
    </section>
  );
};

export default CategoryVideos;