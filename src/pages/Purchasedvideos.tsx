import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import { Video } from "../types/videouser";
import CardDataStatsPur from "../components/CardDataStatsPur";
import { encodeId } from "../utils/hashid"; // ✅ ADDED

const Purchvideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true); // ✅ NEW

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
      .finally(() => setLoadingVideos(false)); // ✅ NEW
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
    <div className="rounded-lg border border-gray-200 p-4 bg-white animate-pulse">
      <div className="h-40 bg-gray-200 rounded mb-4" />
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  );

  return (
    <>
      {/* ✅ ANIMATED WRAPPER (TITLE + GRID TOGETHER) */}
      <div
        className={`transition-all duration-500 ease-out ${
          loadingVideos
            ? "opacity-0 translate-y-4"
            : "opacity-100 translate-y-0"
        }`}
      >
        <Breadcrumb pageName="My Videos" />

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {loadingVideos
            ? [...Array(6)].map((_, i) => <VideoSkeletonCard key={i} />)
            : videos.map((video: any, idx: number) => {
                return (
                  <div
                    key={`${video.id}-${idx}`}
                    style={{ borderLeft: "5px solid transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderLeft = `5px solid ${ACCENT}`)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderLeft =
                        "5px solid transparent")
                    }
                  >
                    <CardDataStatsPur
                      id={video.id}
                      videoTitle={video.title}
                      channelName={video.owner || "Unknown Owner"}
                      total={`${video.views ?? 0} views`}
                      thumbnail={fileUrl(video.thumbnail)}
                      profileImage={fileUrl(video.profile_photo)}
                      onClick={() =>
                        navigate(`/watch/${encodeId(video.id)}`, {
                          state: video,
                        })
                      }
                    />
                  </div>
                );
              })}
        </div>
      </div>
    </>
  );
};

export default Purchvideos;
