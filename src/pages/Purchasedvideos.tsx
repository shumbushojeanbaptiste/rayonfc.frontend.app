import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import { Video } from "../types/videouser";
import CardDataStatsPur from "../components/CardDataStatsPur";
import { encodeId } from "../utils/hashid";

const Purchvideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const navigate = useNavigate();
  const ACCENT = "#05333a";

  /* -----------------------------
     LOAD VIDEOS
  ------------------------------*/
  useEffect(() => {
    api
      .get("/api/accessible/purchased-videos")
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
      <div className="h-44 w-full bg-gray-200 rounded-xl mb-2" />
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-3 bg-gray-200 rounded w-1/6" />
      </div>
    </div>
  );

  return (
    <>
      <Breadcrumb pageName="My Videos" />
      <div className="p-2 md:p-4 2xl:p-10">
      <div className="px-0  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {/* ✅ Show skeletons while loading */}
        {loadingVideos
          ? [...Array(6)].map((_, i) => <VideoSkeletonCard key={i} />)
          : videos.map((video: any, idx: number) => (
              <div
                key={`${video.id}-${idx}`}
                style={{ borderLeft: "5px solid transparent" }}
              >
                <CardDataStatsPur
                  id={video.id} 
                  videoTitle={video.title} 
                  channelName={video.owner || "Unknown Owner"}
                  total={`${video.views ?? 0} views`}
                  duration={video.duration} 
                  thumbnail={fileUrl(video.thumbnail)}
                  profileImage={fileUrl(video.profile_photo|| video.thumbnail)}
                  onClick={() =>
                    navigate(`/watch/${encodeId(video.id)}`, {
                      state: video,
                    })
                  }
                />
              </div>
            ))}
      </div>
      </div>
    </>
  );
};

export default Purchvideos;
