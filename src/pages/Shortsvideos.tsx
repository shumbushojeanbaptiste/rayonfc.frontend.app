import React, { useEffect, useState, useRef, useCallback } from "react";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import CardsDataStatshorts from "../components/CardsDataStatshorts";
import ShortsViewerModal from "./Dashboard/ShortsViewerModal";

interface ShortVideo {
  id: number;
  title: string;
  thumbnail: string;
  video_url: string;
  views: number;
  duration: string;
  price: string;
  owner: string;
}

const Shortvideos: React.FC = () => {
  const [videos, setVideos] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadVideos = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    api
      .get(`/api/videos/shorts?page=${page}`)
      .then((res) => {
        const newVideos: ShortVideo[] = res.data.data || [];

        if (newVideos.length === 0) {
          setHasMore(false);
          return;
        }

        setVideos((prev) => {
          // Prevent duplicates
          const existingIds = new Set(prev.map((v: ShortVideo) => v.id));
          const filteredNewVideos = newVideos.filter(
            (v: ShortVideo) => !existingIds.has(v.id)
          );
          return [...prev, ...filteredNewVideos];
        });

        if (newVideos.length > 0) setPage((p) => p + 1);
      })
      .catch((err) => {
        console.error("Failed to load shorts:", err);
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [page, loadingMore, hasMore]);

  // Initial load
  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Infinite scroll for desktop grid
  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current || loadingMore || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollHeight - scrollTop <= clientHeight + 150) {
        loadVideos();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", onScroll);
      return () => container.removeEventListener("scroll", onScroll);
    }
  }, [loadVideos, loadingMore, hasMore]);

  const ShortsSkeleton = () => (
    <div className="w-[170px] animate-pulse">
      <div className="aspect-[9/16] rounded-xl bg-gray-300 dark:bg-gray-700" />
    </div>
  );

  return (
    <>
   <div className="flex items-center px-2 gap-0">
    <img src="/shorts1.png" alt="" width="50" height="60" className="block" />
      <span className="text-title-lg font-bold leading-none -ml-2">
        eels
      </span>
   </div>

    <Breadcrumb pageName="" />
      <div className="p-2 md:p-4 2xl:p-8">
        {/* Mobile Slider */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory md:hidden pb-4">
          {loading && videos.length === 0
            ? Array.from({ length: 6 }).map((_, i) => <ShortsSkeleton key={i} />)
            : videos.map((video, idx) => (
                <div key={video.id} className="snap-start shrink-0">
                  <CardsDataStatshorts
                    {...video}
                    videoUrl={video.video_url}
                    onClick={() => setActiveIndex(idx)}
                  />
                </div>
              ))}
        </div>

        {/* Desktop Grid */}
        <div
          ref={containerRef}
          className="hidden md:grid gap-4 grid-cols-[repeat(auto-fill,minmax(170px,1fr))] h-[75vh] overflow-y-auto"
        >
          {loading && videos.length === 0
            ? Array.from({ length: 12 }).map((_, i) => <ShortsSkeleton key={i} />)
            : videos.map((video) => (
                <CardsDataStatshorts
                  key={video.id}
                  {...video}
                  videoUrl={video.video_url}
                  onClick={() => setActiveIndex(videos.indexOf(video))}
                />
              ))}
          {loadingMore && (
            <div className="col-span-full text-center text-gray-500 py-2">
              Loading more...
            </div>
          )}
          {!hasMore && (
            <div className="col-span-full text-center text-gray-500 py-2">
              No more videos.
            </div>
          )}
        </div>
      </div>

      {activeIndex !== null && (
        <ShortsViewerModal
          open={true}
          shorts={videos}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
};

export default Shortvideos;
