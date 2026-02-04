import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import CardDataStatsTre from "../components/CardDataStatsTre";
import BuyVideoModal from "../components/BuyVideoModal";
import { getAuthUser } from "../utils/auth";
import { Video } from "../types/videouser";
import { encodeId } from "../utils/hashid";
import { toast } from "react-toastify"; // ✅ import toast

const Trendsvideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const navigate = useNavigate();
  const user = getAuthUser();
 
  const fileUrl = (path?: string) =>
    path && path !== "null" && path !== "undefined"
      ? path
      : "/default-avatar.png";

  // -----------------------------
  // LOAD WALLET BALANCE (ONLY ONCE)
  // -----------------------------
  const refreshWallet = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/api/payments/balance/${user.user_id}`);
      setWalletBalance(Number(res.data?.data?.balance || 0));
    } catch {
      setWalletBalance(0);
    }
  };

  useEffect(() => {
    if (user) refreshWallet();
  }, [user]);

  // -----------------------------
  // HANDLE VIDEO CLICK (NO BALANCE REFRESH)
  // -----------------------------
  const handleVideoClick = (video: Video) => {
    if (!user) {
      toast.error("Please login first"); // ✅ replaced alert
      return;
    }

    if (!video.price || Number(video.price) === 0) {
      navigate(`/watch/${encodeId(video.id)}`, {
        state: { ...video, source: "trending" },
      });
      return;
    }

    setSelectedVideo(video);
  };

  // -----------------------------
  // LOAD TRENDING VIDEOS
  // -----------------------------
  useEffect(() => {
    setLoadingVideos(true);
    api
      .get("/api/videos/trends")
      .then((res) => setVideos(res.data.data || []))
      .catch((err) => console.error("FAILED TO LOAD VIDEOS:", err))
      .finally(() => setLoadingVideos(false));
  }, []);

  const SkeletonCard = () => (
    <div className="rounded-xl p-2 animate-pulse">
      <div className="h-44 bg-gray-300 rounded-xl mb-3" />
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-300 rounded w-1/2" />
    </div>
  );

  return (
    <>
    
      <Breadcrumb pageName="" />
      <div className="p-2 md:p-4 2xl:p-8">
      <div className="px-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {loadingVideos
          ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
          : videos.map((video) => (
              <CardDataStatsTre
                key={video.id}
                id={video.id}
                videoTitle={video.title}
                channelName={video.owner || "Unknown Owner"}
                total={`${video.views ?? 0} views`}
                price={video.price}
                duration={video.duration} 
                thumbnail={fileUrl(video.thumbnail)}
                profileImage={fileUrl(video.profile_photo || video.thumbnail)}
                onClick={() => handleVideoClick(video)}
              />
            ))}
      </div>

      {selectedVideo && (
        <BuyVideoModal
          video={selectedVideo}
          walletBalance={walletBalance}
          onClose={() => setSelectedVideo(null)}
          onSuccess={() => {
            refreshWallet();
            setSelectedVideo(null);
            toast.success("Video purchased successfully!"); // ✅ optional toast
          }}
        />
      )}
      </div>
    </>
  );
};

export default Trendsvideos;
