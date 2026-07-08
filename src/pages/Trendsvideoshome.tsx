import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { encodeId } from "../utils/hashid";
import { Video } from "../types/videouser";

const Trendsvideoshome: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement | null>(null);

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

  const scrollSlider = (direction: "left" | "right") => {
    if (!sliderRef.current) return;

    const scrollAmount = window.innerWidth < 768 ? 340 : 620;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const SkeletonCard = () => (
    <div className="flex-shrink-0 w-[210px] sm:w-[250px] md:w-[300px] lg:w-[330px] animate-pulse">
      <div className="h-[118px] sm:h-[140px] md:h-[170px] lg:h-[185px] rounded bg-zinc-800" />
      <div className="mt-2 h-4 w-3/4 rounded bg-zinc-800" />
    </div>
  );

  return (
    <section className="w-full text-white px-4 sm:px-8 lg:px-12 py-5">
      <div className="relative group">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Trends Videos
          </h2>

          <button
            type="button"
            onClick={() => navigate("/trends")}
            className="text-sm sm:text-base font-semibold text-blue-500 hover:text-blue-400 transition"
          >
            Watch All
          </button>
        </div>

        <div
          ref={sliderRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto scroll-smooth no-scrollbar pb-4"
        >
          {loadingVideos ? (
            [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
          ) : videos.length > 0 ? (
            videos.map((video) => (
              <div
                key={video.id}
                onClick={() =>
                  navigate(`/watch/${encodeId(video.id)}`, {
                    state: { ...video, source: "trending" },
                  })
                }
                className="group/card flex-shrink-0 w-[210px] sm:w-[250px] md:w-[300px] lg:w-[330px] cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-20"
              >
                <div className="relative overflow-hidden rounded bg-zinc-900 shadow-lg">
                  <img
                    src={fileUrl(video.thumbnail)}
                    alt={video.title}
                    className="w-full h-[118px] sm:h-[140px] md:h-[170px] lg:h-[185px] object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70" />

                  <div className="absolute top-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[11px] text-white">
                    {video.duration || "--"}
                  </div>
                </div>

                <div className="px-1 pt-2 pb-1">
                  <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-white leading-snug">
                    {video.title || "Untitled Video"}
                  </h3>

                  {/*<p className="mt-1 line-clamp-1 text-xs text-gray-300">
                    {video.owner || "Canal+ Original"}
                  </p>*/}
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-sm text-slate-400">
              No trending videos available.
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => scrollSlider("left")}
          className="hidden lg:flex absolute left-0 top-[54%] -translate-y-1/2 h-[185px] w-12 items-center justify-center bg-black/40 hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-9 h-9 text-white" />
        </button>

        <button
          type="button"
          onClick={() => scrollSlider("right")}
          className="hidden lg:flex absolute right-0 top-[54%] -translate-y-1/2 h-[185px] w-12 items-center justify-center bg-black/40 hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-9 h-9 text-white" />
        </button>
      </div>
    </section>
  );
};

export default Trendsvideoshome;