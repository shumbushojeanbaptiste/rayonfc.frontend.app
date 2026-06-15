import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import BuyVideoModal from "../components/SubscribePlanModal";
import { getAuthUser } from "../utils/auth";
import { Video } from "../types/videouser";
import { encodeId } from "../utils/hashid";

const CATEGORY_ID = 1;

const Highlights: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [checkingAccessId, setCheckingAccessId] = useState<number | null>(null);

  const navigate = useNavigate();
  const user = getAuthUser();
  const sliderRef = useRef<HTMLDivElement | null>(null);

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
        state: { ...video, source: "Highlights" },
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
          state: { ...video, source: "Highlights" },
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

  const scrollSlider = (direction: "left" | "right") => {
    if (!sliderRef.current) return;

    const scrollAmount = window.innerWidth < 768 ? 340 : 620;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const SkeletonCard = () => (
    <div className="flex-shrink-0 w-[210px] sm:w-[250px] md:w-[300px] lg:w-[330px] animate-pulse">
      <div className="h-[118px] sm:h-[140px] md:h-[170px] lg:h-[185px] rounded bg-zinc-800" />
    </div>
  );

  return (
    <>
      <Breadcrumb pageName="" />

      <section className="w-full text-white px-4 sm:px-8 lg:px-12 py-5">
        <div className="relative group">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Highlights
            </h2>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-2 sm:gap-3 overflow-x-auto scroll-smooth no-scrollbar pb-4"
          >
            {loadingVideos ? (
              [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            ) : videos.length > 0 ? (
              videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() =>
                    navigate(`/watch/${encodeId(video.id)}`, { state: video })
                  }
                  className="group/card relative flex-shrink-0 w-[210px] sm:w-[250px] md:w-[300px] lg:w-[330px] cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-20"
                >
                  <div className="relative overflow-hidden rounded bg-zinc-900 shadow-lg">
                    <img
                      src={fileUrl(video.thumbnail)}
                      alt={video.title}
                      className="w-full h-[118px] sm:h-[140px] md:h-[170px] lg:h-[185px] object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80" />

                    <div className="absolute top-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[11px] text-white">
                      {video.duration || "--"}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="line-clamp-1 text-sm sm:text-base font-semibold text-white">
                        {video.title || "Untitled Video"}
                      </h3>

                      {/*<p className="mt-1 line-clamp-1 text-xs text-gray-300">
                        {getChannelName(video)}
                      </p>*/}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-sm text-slate-400">
                No highlights available.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => scrollSlider("left")}
            className="hidden lg:flex absolute left-0 top-[54%] -translate-y-1/2 h-[185px] w-12 items-center justify-center bg-black/40 hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-9 h-9 text-white" />
          </button>

          <button
            type="button"
            onClick={() => scrollSlider("right")}
            className="hidden lg:flex absolute right-0 top-[54%] -translate-y-1/2 h-[185px] w-12 items-center justify-center bg-black/40 hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-9 h-9 text-white" />
          </button>
        </div>

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

export default Highlights;