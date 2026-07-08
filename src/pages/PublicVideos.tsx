import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { encodeId } from "../utils/hashid";
import { Video } from "../types/videouser";

const PublicVideos: React.FC = () => {
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
      .get("/api/videos/public/allVideos")
      .then((res) => {
        setVideos(res.data?.data || []);
      })
      .catch((err) => {
        console.error("FAILED TO LOAD PUBLIC VIDEOS:", err);
      })
      .finally(() => {
        setLoadingVideos(false);
      });
  }, []);

  const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="w-full aspect-video rounded-lg bg-zinc-800" />
      <div className="mt-3 h-4 w-3/4 rounded bg-zinc-800" />
      <div className="mt-2 h-3 w-1/2 rounded bg-zinc-800" />
    </div>
  );

  return (
    <section className="w-full min-h-screen text-white px-4 sm:px-6 lg:px-10 xl:px-12 py-6">
      {/*<div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Public Videos
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Watch all publicly available videos.
        </p>
      </div>*/}

      {loadingVideos ? (
        <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {[...Array(12)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() =>
                navigate(`/watch/${encodeId(video.id)}`, {
                  state: { ...video, source: "public" },
                })
              }
              className="group cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:z-10"
            >
              <div className="relative overflow-hidden rounded-lg bg-zinc-900 shadow-lg">
                <img
                  src={fileUrl(video.thumbnail)}
                  alt={video.title || "Public video"}
                  className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                <div className="absolute top-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[11px] text-white">
                  {video.duration || "--"}
                </div>
              </div>

              <div className="px-1 pt-2 pb-1">
                <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-white leading-snug">
                  {video.title || "Untitled Video"}
                </h3>

                <p className="mt-1 line-clamp-1 text-xs text-gray-400">
                  {video.owner || "Public Video"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-sm text-slate-400">
          No public videos available.
        </div>
      )}
    </section>
  );
};

export default PublicVideos;