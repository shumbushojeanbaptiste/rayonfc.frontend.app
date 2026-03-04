import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import { Video } from "../types/videouser";
import CardDataStatsLat from "../components/CardDataStatsLat";
import { encodeId } from "../utils/hashid";

const Latestvideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const navigate = useNavigate();

  /* -----------------------------
     LOAD VIDEOS
  ------------------------------*/
  useEffect(() => {
    api
      .get("/api/accessible/latest-video")
      .then((res) => setVideos(res.data.data || []))
      .catch((err) => console.error("FAILED TO LOAD VIDEOS:", err))
      .finally(() => setLoadingVideos(false));
  }, []);

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
     SKELETON CARD
  ------------------------------*/
  const VideoSkeletonCard = () => (
    <div className="rounded-xl p-2 bg-white animate-pulse">
      <div className="h-44 bg-gray-300 rounded-xl mb-2" />
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 bg-gray-300 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-300 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-300 rounded w-1/3" />
    </div>
  );

  return (
    <>
      <Breadcrumb pageName="Latest Videos" />
     <div className="p-2 md:p-4 2xl:p-8">
      <div className="px-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {loadingVideos
          ? [...Array(6)].map((_, i) => <VideoSkeletonCard key={i} />)
          : videos.map((video: any, idx: number) => (
              <div
                key={`${video.id}-${idx}`}
                style={{ borderLeft: "5px solid transparent" }}
              >
                <CardDataStatsLat 
                  id={video.id}
                  videoTitle={video.title}
                  channelName={video.owner_name || "Unknown Owner"}
                  total={`${video.views ?? 0} views`}
                  thumbnail={fileUrl(video.thumbnail)}
                  profileImage={fileUrl(video.profile_photo || video.thumbnail )}
                  onClick={() =>
                    navigate(`/watch/${encodeId(video.id)}`, { state: video })
                  }
                />
              </div>
            ))}
      </div>
      </div>
    </>
  );
};

export default Latestvideos;
