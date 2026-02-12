import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import BuyVideoModal from "../components/SubscribePlanModal";
import { getAuthUser } from "../utils/auth";
import { Video } from "../types/videouser";
import { encodeId } from "../utils/hashid";
import CardDataStatsTresample from "../components/CardDataStatsTresample";

const Trendsvideossample: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const navigate = useNavigate();
  const user = getAuthUser();

  /* -----------------------------
     LOAD VIDEOS
  ------------------------------*/
  useEffect(() => {
    api
      .get("/api/videos/trends")
      .then((res) => setVideos(res.data.data || []))
      .catch((err) => console.error("FAILED TO LOAD VIDEOS:", err))
      .finally(() => setLoadingVideos(false));
  }, []);

  /* -----------------------------
     LOAD WALLET BALANCE
  ------------------------------*/
  useEffect(() => {
    if (!user) {
      setWalletBalance(0);
      setLoadingBalance(false);
      return;
    }

    api
      .get(`/api/payments/balance/${user.user_id}`)
      .then((res) => setWalletBalance(Number(res.data.data?.balance || 0)))
      .catch(() => setWalletBalance(0))
      .finally(() => setLoadingBalance(false));
  }, [user]);

  /* -----------------------------
     FILE URL
  ------------------------------*/
  const fileUrl = (path?: string) => {
    if (!path || path === "null" || path === "undefined") {
      return "/default-avatar.png";
    }
    return path.includes("/") ? path : `${path}`;
  };

  /* -----------------------------
     ACTIONS
  ------------------------------*/
  const handleBuy = (video: Video) => {
    if (!user) {
      alert("Please login first");
      return;
    }
    setSelectedVideo(video);
  };

  const handleAddMoney = () => {
    navigate({ pathname: "/studio", search: "?deposit=true" });
  };

  const handleWatch = (video: Video) => {
    navigate(`/watching/${encodeId(video.id)}`, {
      state: { ...video, source: "trending" },
    });
  };

  /* -----------------------------
     SKELETON CARD
  ------------------------------*/
  const VideoSkeletonCard = () => (
    <div className="rounded-xl p-2 bg-white animate-pulse">
      {/* Thumbnail */}
      <div className="h-44 w-full bg-gray-200 rounded-xl mb-2" />

      {/* Profile + Titles */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      {/* Views / Duration */}
      <div className="flex justify-between items-center mt-2">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-3 bg-gray-200 rounded w-1/6" />
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`transition-all duration-500 ease-out ${
          loadingVideos ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <Breadcrumb pageName="Trending Videos" />
        <div className="p-2 md:p-4 2xl:p-8">
        <div className="px-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {loadingVideos
            ? [...Array(6)].map((_, i) => <VideoSkeletonCard key={i} />)
            : videos.map((video) => {
                const canBuy = !loadingBalance && walletBalance >= video.price;

                return (
                  <div key={video.id} style={{ borderLeft: "5px solid transparent" }}>
                    <CardDataStatsTresample
                      id={video.id}
                      videoTitle={video.title}
                      channelName={video.owner || "Unknown Owner"}
                      total={`${video.views ?? 0} views`}
                      duration={video.duration}
                      price={video.price}
                      thumbnail={fileUrl(video.thumbnail)}
                      profileImage={fileUrl(video.profile_photo)}
                      canBuy={canBuy}
                      onClick={() => handleWatch(video)}
                      onBuy={() => handleBuy(video)}
                      onAddMoney={handleAddMoney}
                    />
                  </div>
                );
              })}
        </div>
      </div>

     </div>
    </>
  );
};

export default Trendsvideossample;
