import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { encodeId } from "../utils/hashid";
import CardDataStatsTre from "../components/CardDataStatsTre";
import { Video } from "../types/videouser";

const Trendsvideos: React.FC = () => {
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

    const scrollAmount = window.innerWidth < 768 ? 320 : 460;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const SkeletonCard = () => (
    <div className="flex-shrink-0 w-[280px] sm:w-[340px] md:w-[420px] animate-pulse">
      <div className="h-[170px] sm:h-[190px] md:h-[230px] rounded-md bg-zinc-800 mb-3" />
      <div className="h-6 w-2/3 bg-zinc-800 rounded mb-2" />
      <div className="h-5 w-1/3 bg-zinc-800 rounded" />
    </div>
  );

  return (
    <div className="min-h-screen  text-white px-3 sm:px-5 md:px-8 py-6">
      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">
            Trends Videos
          </h2>

          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollSlider("left")}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <button
              type="button"
              onClick={() => scrollSlider("right")}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div
          ref={sliderRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth no-scrollbar"
        >
          {loadingVideos
            ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
            : videos.map((video) => (
                <CardDataStatsTre
                  key={video.id}
                  id={video.id}
                  videoTitle={video.title}
                  channelName={video.owner || "Canal+ Original"}
                  duration={video.duration}
                  price={video.price}
                  thumbnail={fileUrl(video.thumbnail)}
                  onClick={() =>
                    navigate(`/watch/${encodeId(video.id)}`, {
                      state: { ...video, source: "trending" },
                    })
                  }
                />
              ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => scrollSlider("left")}
            className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <button
            type="button"
            onClick={() => scrollSlider("right")}
            className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Trendsvideos;