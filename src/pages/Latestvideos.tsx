import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Video } from "../types/videouser";
import { encodeId } from "../utils/hashid";

const Latestvideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setLoadingVideos(true);

    api
      .get("/api/accessible/latest-video")
      .then((res) => {
        setVideos(res.data?.data || []);
      })
      .catch((err) => {
        console.error("FAILED TO LOAD VIDEOS:", err);
      })
      .finally(() => {
        setLoadingVideos(false);
      });
  }, []);

  const fileUrl = (path?: string) => {
    if (!path || path === "null" || path === "undefined") {
      return "/default-avatar.png";
    }

    return path;
  };

  const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="aspect-video w-full rounded-xl bg-zinc-800" />
      <div className="mt-3 h-4 w-4/5 rounded bg-zinc-800" />
      <div className="mt-2 h-3 w-2/5 rounded bg-zinc-800" />
    </div>
  );

  return (
    <section className="w-full text-white px-4 sm:px-8 lg:px-12 py-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Latest Videos
        </h2>
      </div>

      {loadingVideos ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((video, idx) => (
            <div
              key={`${video.id}-${idx}`}
              onClick={() =>
                navigate(`/watch/${encodeId(video.id)}`, {
                  state: {
                    ...video,
                    source: "latest",
                  },
                })
              }
              className="group cursor-pointer"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 shadow-lg">
                <img
                  src={fileUrl(video.thumbnail)}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute top-2 left-2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase">
                  New
                </div>

                <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[11px] text-white">
                  {video.duration || "--"}
                </div>
              </div>

              <div className="mt-3">
                <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-white">
                  {video.title || "Untitled Video"}
                </h3>
                {/*<h3 className="line-clamp-2 text-xs sm:text-base font-normal text-white">
                  {video.description || "Untitled Video"}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-gray-300">
                  {video.owner_name || video.owner || "Unknown Owner"}
                </p>*/}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-sm text-gray-400">
          No latest videos available.
        </div>
      )}
    </section>
  );
};

export default Latestvideos;