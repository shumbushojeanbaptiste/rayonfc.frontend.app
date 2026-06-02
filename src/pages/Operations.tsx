import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import BuyVideoModal from "../components/SubscribePlanModal";
import { getAuthUser } from "../utils/auth";
import { Video } from "../types/videouser";
import { encodeId } from "../utils/hashid";
import CardDataStatsMusic from "../components/CardDataStatsmusic";

const CATEGORY_ID = 3;

const Operations: React.FC = () => {
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
        state: { ...video, source: "Operations" },
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
          state: { ...video, source: "Operations" },
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

    const scrollAmount = window.innerWidth < 768 ? 320 : 460;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const SkeletonCard = () => (
    <div className="flex-shrink-0 w-[280px] sm:w-[340px] md:w-[420px] animate-pulse">
      <div className="h-[170px] sm:h-[190px] md:h-[230px] rounded-md bg-zinc-800 mb-3" />
      <div className="h-6 w-2/3 bg-zinc-800 rounded mb-2" />
      <div className="h-5 w-1/3 bg-zinc-800 rounded" />
    </div>
  );

  return (
    <>
      <Breadcrumb pageName="" />

      <div className="min-h-screen text-white px-3 sm:px-5 md:px-8 py-6">
        <div className="relative">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">
              Operations
            </h2>

            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollSlider("left")}
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              <button
                type="button"
                onClick={() => scrollSlider("right")}
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth no-scrollbar"
          >
            {loadingVideos
              ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
              : videos.map((video) => (
                  <CardDataStatsMusic
                    key={video.id}
                    id={video.id}
                    videoTitle={video.title}
                    channelName={getChannelName(video)}
                    total={`${video.views ?? 0} views`}
                    price={video.price}
                    duration={video.duration || "--"}
                    thumbnail={fileUrl(video.thumbnail)}
                    profileImage={fileUrl(video.profile_photo || video.thumbnail)}
                    //onClick={() => handleVideoClick(video)}
                    onClick={() =>  navigate(`/watch/${encodeId(video.id)}`, { state: video })}
                  />
                ))}
          </div>

          <div className="mt-5 flex items-center justify-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => scrollSlider("left")}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <button
              type="button"
              onClick={() => scrollSlider("right")}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
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
      </div>
    </>
  );
};

export default Operations;