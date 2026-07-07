import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { encodeId } from "../utils/hashid";
import { Video } from "../types/videouser";

const Trendsvideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const navigate = useNavigate();

  const fileUrl = (path?: string) =>
    path && path !== "null" && path !== "undefined"
      ? path
      : "/default-avatar.png";

  useEffect(() => {
    setLoadingVideos(true);

    api
      .get("/api/videos/trends")
      .then((res) => {
        setVideos(res.data?.data || []);
      })
      .catch((err) => {
        console.error("FAILED TO LOAD TRENDING VIDEOS:", err);
      })
      .finally(() => {
        setLoadingVideos(false);
      });
  }, []);

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
          Trends Videos
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
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() =>
                navigate(`/watch/${encodeId(video.id)}`, {
                  state: { ...video, source: "trending" },
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

                <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[11px] text-white">
                  {video.duration || "--"}
                </div>
              </div>

              <div className="mt-3">
                <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-white">
                  {video.title || "Untitled Video"}
                </h3>

                {/*<p className="mt-1 line-clamp-1 text-xs text-gray-300">
                  {video.owner || "Canal+ Original"}
                </p>*/}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-sm text-slate-400">
          No trending videos available.
        </div>
      )}
    </section>
  );
};

export default Trendsvideos;