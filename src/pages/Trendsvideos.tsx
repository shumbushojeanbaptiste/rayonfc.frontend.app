import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import CardDataStatsTre from "../components/CardDataStatsTre";
import BuyVideoModal from "../components/BuyVideoModal";
import { getAuthUser } from "../utils/auth";
import { Video } from "../types/videouser";
import { encodeId } from "../utils/hashid";

const Trendsvideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [checkingAccessId, setCheckingAccessId] = useState<number | null>(null);

  const navigate = useNavigate();
  const user = getAuthUser();

  /* ===============================
     LOAD TRENDING VIDEOS
  ================================ */
  useEffect(() => {
    setLoadingVideos(true);
    api
      .get("/api/videos/trends")
      .then((res) => setVideos(res.data.data || []))
      .catch((err) => console.error("FAILED TO LOAD VIDEOS:", err))
      .finally(() => setLoadingVideos(false));
  }, []);

  /* ===============================
     LOAD WALLET BALANCE
  ================================ */
  useEffect(() => {
    if (!user) {
      setWalletBalance(0);
      setLoadingBalance(false);
      return;
    }

    api
      .get(`/api/payments/balance/${user.user_id}`)
      .then((res) =>
        setWalletBalance(Number(res.data.data?.balance || 0))
      )
      .catch(() => setWalletBalance(0))
      .finally(() => setLoadingBalance(false));
  }, [user]);

  /* ===============================
     FILE URL FALLBACK
  ================================ */
  const fileUrl = (path?: string) =>
    path && path !== "null" && path !== "undefined" ? path : "/default-avatar.png";

  /* ===============================
     HANDLE VIDEO CLICK
  ================================ */
  const handleVideoClick = async (video: Video) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    // Free video → watch directly
    if (!video.price || Number(video.price) === 0) {
      navigate(`/watch/${encodeId(video.id)}`, { state: { ...video, source: "trending" } });
      return;
    }

    // Prevent multiple API calls if already checking
    if (checkingAccessId === video.id) return;
    setCheckingAccessId(video.id);

    try {
      const res = await api.get(`/api/videos/${video.id}/has-access`);
      const hasAccess = res?.data?.data?.hasAccess ?? res?.data?.hasAccess ?? false;

      if (hasAccess) {
        navigate(`/watch/${encodeId(video.id)}`, { state: { ...video, source: "trending" } });
      } else {
        setSelectedVideo(video);
      }
    } catch (err) {
      console.warn("Failed to check video access:", err);
      setSelectedVideo(video);
    } finally {
      setCheckingAccessId(null);
    }
  };

  /* ===============================
     REFRESH WALLET BALANCE
  ================================ */
  const refreshWallet = () => {
    if (!user) return;
    api
      .get(`/api/payments/balance/${user.user_id}`)
      .then((res) =>
        setWalletBalance(Number(res.data.data?.balance || 0))
      )
      .catch(() => {});
  };

  return (
    <>
      <Breadcrumb pageName="Trending Videos" />

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingVideos ? (
          <p className="col-span-full text-center text-gray-500">Loading videos...</p>
        ) : (
          videos.map((video) => (
            <CardDataStatsTre
              key={video.id}
              id={video.id}
              videoTitle={video.title}
              channelName={video.owner || "Unknown Owner"}
              total={`${video.views ?? 0} views`}
              price={video.price}
              duration={video.duration}
              thumbnail={fileUrl(video.thumbnail)}
              profileImage={fileUrl(video.profile_photo)}
              onClick={() => handleVideoClick(video)}
            />
          ))
        )}
      </div>

      {/* ===============================
          BUY VIDEO MODAL
      ================================ */}
      {selectedVideo && (
        <BuyVideoModal
          video={selectedVideo}
          walletBalance={walletBalance}
          onClose={() => setSelectedVideo(null)}
          onSuccess={() => {
            setSelectedVideo(null);
            refreshWallet();
          }}
        />
      )}
    </>
  );
};

export default Trendsvideos;
