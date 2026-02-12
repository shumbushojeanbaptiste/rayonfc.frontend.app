import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import BuyVideoModal from "../components/SubscribePlanModal";
import { getAuthUser } from "../utils/auth";
import { Video } from "../types/videouser";
import { encodeId } from "../utils/hashid";
import CardDataStatsMusic from "../components/CardDataStatsmusic";

const CATEGORY_ID = 3;

const Behind: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [checkingAccessId, setCheckingAccessId] = useState<number | null>(null);

  const navigate = useNavigate();
  const user = getAuthUser();

  /* ===============================
     LOAD MUSIC VIDEOS
  ================================ */
  useEffect(() => {
    setLoadingVideos(true);

    api
      .post("/api/videos/by_category", {
        category_id: CATEGORY_ID, // ✅ backend expects category_id
      })
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
      return;
    }

    api
      .get(`/api/payments/balance/${user.user_id}`)
      .then((res) =>
        setWalletBalance(Number(res.data.data?.balance || 0))
      )
      .catch(() => setWalletBalance(0));
  }, [user]);

  /* ===============================
     FILE URL FALLBACK
  ================================ */
  const fileUrl = (path?: string) =>
    path && path !== "null" && path !== "undefined"
      ? path
      : "/default-avatar.png";

  /* ===============================
     HANDLE VIDEO CLICK
  ================================ */
  const handleVideoClick = async (video: Video) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    // Free video
    if (!video.price || Number(video.price) === 0) {
      navigate(`/watch/${encodeId(video.id)}`, {
        state: { ...video, source: "Behind the Scenes" },
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

  /* ===============================
     REFRESH WALLET
  ================================ */
  const refreshWallet = () => {
    if (!user) return;
    api
      .get(`/api/payments/balance/${user.user_id}`)
      .then((res) =>
        setWalletBalance(Number(res.data.data?.balance || 0))
      );
  };

  return (
    <>
      <Breadcrumb pageName="Behind the Scenes" />
    <div className="p-2 md:p-4 2xl:p-8">
      <div className="px-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingVideos ? (
          <p className="col-span-full text-center text-gray-500">
            Loading videos...
          </p>
        ) : (
          videos.map((video) => (
            <CardDataStatsMusic
              key={video.id}
              id={video.id}
              videoTitle={video.title} 
              channelName={video.owner || "Unknown Artist"}
              total={`${video.views ?? 0} views`}
              price={video.price}
              duration={video.duration || "--"}
              thumbnail={fileUrl(video.thumbnail)}
              profileImage={fileUrl(video.profile_photo || video.thumbnail)} // ✅ fallback
              //onClick={() => handleVideoClick(video)}
              onClick={() =>  navigate(`/watch/${encodeId(video.id)}`, { state: video })}
            />
          ))
        )}
      </div>

      {/* BUY MODAL */}
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

      </div>
    </>
  );
};

export default Behind;
