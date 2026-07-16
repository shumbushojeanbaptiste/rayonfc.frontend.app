import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import { getAuthUser } from "../utils/auth";
import { Video } from "../types/videouser";
import { encodeId } from "../utils/hashid";
import { toast } from "react-toastify";
import CardLive from "../components/CardLive";
import { Search, ChevronRight } from "lucide-react";

const Livevideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const user = getAuthUser();

  const fileUrl = (path?: string) =>
    path && path !== "null" && path !== "undefined"
      ? path
      : "/default-avatar.png";

  const handleVideoClick = (video: Video) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    navigate(`/live/watch/${encodeId(video.id)}`, {
      state: video,
    });
  };

  const trendingRowRef = useRef<HTMLDivElement | null>(null);

  const scrollRow = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (!ref.current) return;

    const amount = ref.current.clientWidth * 0.85;

    ref.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    setLoadingVideos(true);

    api
      .get("/api/videos/live")
      .then((res) => setVideos(res.data.data || []))
      .catch((err) => console.error("FAILED TO LOAD LIVE VIDEOS:", err))
      .finally(() => setLoadingVideos(false));
  }, []);

  const filteredVideos = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return videos;

    return videos.filter((video) =>
      [video.title, video.owner]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [videos, search]);

  const featuredVideo = filteredVideos[0] || null;
  const trendingVideos = filteredVideos.slice(0, 8);
  const moreLiveVideos = filteredVideos.slice(1);

  const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="h-[160px] xsm:h-[180px] sm:h-[210px] md:h-[230px] rounded-sm bg-neutral-800" />
      <div className="mt-4 h-5 w-3/4 rounded bg-neutral-800" />
      <div className="mt-2 h-4 w-1/2 rounded bg-neutral-800" />
    </div>
  );

  return (
    <>
      <Breadcrumb pageName="" />

      <div className="min-h-screen text-white">
        <div className="px-3 md:px-5 lg:px-8 py-4">
          {/* TOP BAR */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              {/*<h1 className="font-canal text-2xl md:text-3xl font-semibold tracking-tight">
                Live Streaming
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Discover live content in a premium entertainment style.
              </p>*/}
            </div>

            {/*<div className="relative w-full md:w-[360px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search live videos..."
                className="h-11 w-full rounded-full border border-white/10 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-red-500/40"
              />
            </div>*/}
          </div>

          {/* HERO */}
          {featuredVideo && (
            <div
              className="relative mb-8 md:mb-10 overflow-hidden rounded-2xl  cursor-pointer"
              onClick={() => handleVideoClick(featuredVideo)}
            >
              <img
                src={fileUrl(featuredVideo.thumbnail)}
                alt={featuredVideo.title}
                className="h-[220px] xsm:h-[250px] sm:h-[320px] md:h-[420px] w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

              <div className="absolute left-4 bottom-4 md:left-10 md:bottom-10 max-w-[90%] md:max-w-[650px]">
                <div className="mb-2 md:mb-3 inline-flex items-center gap-2 rounded-sm bg-red-600 px-2.5 py-1 md:px-3 md:py-1 text-[10px] md:text-xs font-bold uppercase tracking-wide text-white">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  Live Now
                </div>

                <h2 className="font-canal text-xl sm:text-3xl md:text-5xl font-extrabold leading-tight">
                  {featuredVideo.title}
                </h2>

                <p className="mt-2 md:mt-3 text-xs sm:text-sm md:text-base text-gray-300">
                  {(featuredVideo.owner || "Rayon TV")} •{" "}
                  {(featuredVideo.views ?? 0).toLocaleString()} watching
                </p>

                <button className="mt-4 md:mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 md:px-5 md:py-3 text-xs md:text-sm font-semibold text-black transition hover:bg-red-600 hover:text-white">
                  Watch now
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* TRENDING ROW */}
          <section className="mb-8 md:mb-10">
            <div className="mb-3 md:mb-4 flex items-center justify-between">
              <h2 className="font-canal text-lg sm:text-xl md:text-2xl font-semibold">
                Trending Live
              </h2>
            </div>

            <div className="group relative">
              {/* LEFT ARROW - desktop only */}
              <button
                type="button"
                onClick={() => scrollRow(trendingRowRef, "left")}
                className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center
                           w-11 h-20 rounded-md bg-black/55 text-white backdrop-blur-sm
                           opacity-0 transition-all duration-300 hover:bg-black/75 md:flex group-hover:opacity-100"
                aria-label="Scroll left"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* RIGHT ARROW - desktop only */}
              <button
                type="button"
                onClick={() => scrollRow(trendingRowRef, "right")}
                className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center
                           w-11 h-20 rounded-md bg-black/55 text-white backdrop-blur-sm
                           opacity-0 transition-all duration-300 hover:bg-black/75 md:flex group-hover:opacity-100"
                aria-label="Scroll right"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* MOBILE SWIPE HINT */}
              <div className="mb-2 flex md:hidden justify-end">
                <span className="text-[11px] text-gray-400">Swipe to explore</span>
              </div>

              {/* SLIDER ROW */}
              <div
                ref={trendingRowRef}
                className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide snap-x snap-mandatory"
              >
                {loadingVideos
                  ? [...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="snap-start min-w-[78%] xsm:min-w-[68%] sm:min-w-[260px] md:min-w-[290px] flex-shrink-0"
                      >
                        <SkeletonCard />
                      </div>
                    ))
                  : trendingVideos.map((video) => (
                      <div
                        key={video.id}
                        className="snap-start min-w-[78%] xsm:min-w-[68%] sm:min-w-[260px] md:min-w-[290px] flex-shrink-0"
                      >
                        <CardLive
                          id={video.id}
                          videoTitle={video.title}
                          channelName={video.owner || "Live Channel"}
                          total={`${video.views ?? 0} watching`}
                          duration={video.duration || "Live"}
                          thumbnail={fileUrl(video.thumbnail)}
                          profileImage={fileUrl(video.profile_photo || video.thumbnail)}
                          price={video.price}
                          category="Live Football"
                          onClick={() => handleVideoClick(video)}
                        />
                      </div>
                    ))}
              </div>
            </div>
          </section>

          {/* ALL LIVE GRID */}
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-canal text-lg sm:text-xl md:text-2xl font-semibold">
                More Live Channels
              </h2>
            </div>

            <div className="grid grid-cols-1 xsm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {loadingVideos
                ? [...Array(8)].map((_, i) => (
                    <div key={i}>
                      <div className="h-[160px] xsm:h-[180px] sm:h-[210px] md:h-[230px] rounded-sm bg-neutral-800 animate-pulse" />
                      <div className="mt-3 h-5 w-3/4 rounded bg-neutral-800 animate-pulse" />
                      <div className="mt-2 h-4 w-1/2 rounded bg-neutral-800 animate-pulse" />
                    </div>
                  ))
                : moreLiveVideos.map((video) => (
                    <CardLive
                      key={video.id}
                      id={video.id}
                      videoTitle={video.title}
                      channelName={video.owner || "Live Channel"}
                      total={`${video.views ?? 0} watching`}
                      duration={video.duration || "Live"}
                      thumbnail={fileUrl(video.thumbnail)}
                      profileImage={fileUrl(video.profile_photo || video.thumbnail)}
                      price={video.price}
                      category="Live Sports"
                      onClick={() => handleVideoClick(video)}
                    />
                  ))}
            </div>
          </section>

          {!loadingVideos && filteredVideos.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#111] p-8 md:p-10 text-center text-gray-300">
              No live videos found.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Livevideos;