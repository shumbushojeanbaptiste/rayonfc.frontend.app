import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import CardDataStatsTre from "../components/CardDataStatsTre";
import BuyVideoModal from "../components/BuyVideoModal";
import { getAuthUser } from "../utils/auth";
import { Video } from "../types/videouser";

const Trendsvideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const navigate = useNavigate();
  const ACCENT = "#05333a";
  const user = getAuthUser();

  /* -----------------------------
     LOAD VIDEOS
  ------------------------------*/
  useEffect(() => {
    api
      .get("/api/videos/trends")
      .then((res) => setVideos(res.data.data || []))
      .catch((err) => console.error("FAILED TO LOAD VIDEOS:", err));
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
      .then((res) =>
        setWalletBalance(Number(res.data.data?.balance || 0))
      )
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
    // ✅ correct route + auto-open deposit modal
    navigate({
      pathname: "/studio",
      search: "?deposit=true",
    });
  };

 const handleWatch = (video: Video) => {
  navigate(`/watch/${video.id}`, {
    state: {
      ...video,
      source: "trending",
    },
  });
};


  return (
    <>
      <Breadcrumb pageName="Trending Videos" />

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => {
          const canBuy = !loadingBalance && walletBalance >= video.price;

          return (
            <div
              key={video.id}
              style={{ borderLeft: "5px solid transparent" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderLeft = `5px solid ${ACCENT}`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderLeft = "5px solid transparent")
              }
            >
              <CardDataStatsTre
                id={video.id}
                videoTitle={video.title}
                channelName={video.owner || "Unknown Owner"}
                total={`${video.views ?? 0} views`}
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

      {/* BUY VIDEO MODAL */}
      {selectedVideo && (
        <BuyVideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onSuccess={() => {
            setSelectedVideo(null);

            // refresh balance after purchase
            if (user) {
              api
                .get(`/api/payments/balance/${user.user_id}`)
                .then((res) =>
                  setWalletBalance(Number(res.data.data?.balance || 0))
                )
                .catch(() => {});
            }
          }}
        />
      )}
    </>
  );
};

export default Trendsvideos;
