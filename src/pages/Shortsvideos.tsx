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

  const observerRef = useRef<HTMLDivElement | null>(null);

  const loadVideos = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const res = await api.get(`/api/videos/shorts?page=${page}`);
      const newVideos: ShortVideo[] = res.data.data || [];

      if (newVideos.length === 0) {
        setHasMore(false);
        return;
      }

      setVideos((prev) => {
        const ids = new Set(prev.map((v) => v.id));
        return [...prev, ...newVideos.filter((v) => !ids.has(v.id))];
      });

      setPage((p) => p + 1);
    } catch (err) {
      console.error("Failed to load shorts:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore]);

  // Initial load
  useEffect(() => {
  loadVideos();
  }, [loadVideos]);


  // IntersectionObserver for infinite loading (mobile + desktop)
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadVideos();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loadVideos]);

  const ShortsSkeleton = () => (
    <div className="w-full max-w-[170px] animate-pulse">
      <div className="aspect-[9/16] rounded-xl bg-gray-300 dark:bg-gray-700" />
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-center px-2">
        <img src="/shorts1.png" alt="" width="50" height="60" />
        <span className="text-title-lg font-bold -ml-2">eels</span>
      </div>

      <Breadcrumb pageName="" />

      <div className="p-2 md:p-4 2xl:p-8">
        {/* Mobile horizontal slider */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory md:hidden pb-4">
          {loading && videos.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <ShortsSkeleton key={i} />
              ))
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

        {/* Desktop grid */}
        <div className="hidden md:grid gap-4 grid-cols-[repeat(auto-fill,minmax(170px,1fr))] h-[75vh] scroll-hover">
          {loading && videos.length === 0
            ? Array.from({ length: 12 }).map((_, i) => (
                <ShortsSkeleton key={i} />
              ))
            : videos.map((video, idx) => (
                <CardsDataStatshorts
                  key={video.id}
                  {...video}
                  videoUrl={video.video_url}
                  onClick={() => setActiveIndex(idx)}
                />
              ))}

          {/* Infinite loader */}
          {hasMore && (
            <div
              ref={observerRef}
              className="col-span-full flex justify-center py-4 text-gray-500"
            >
              {loadingMore && "Loading more..."}
            </div>
          )}

          {!hasMore && (
            <div className="col-span-full text-center text-gray-500 py-4">
              No more videos.
            </div>
          )}
        </div>
      </div>

      {activeIndex !== null && (
        <ShortsViewerModal
          open
          shorts={videos}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
};

export default Shortvideos;
