import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { encodeId } from "../utils/hashid";
import { Video } from "../types/videouser";
import Categories, { Category } from "../components/categories/Categories";
import CategoryVideos from "./CategoryVideos";

const Trendsvideos: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeCategoryId, setActiveCategoryId] = useState<number>(0);

  const fileUrl = (path?: string) =>
    path && path !== "null" && path !== "undefined"
      ? path
      : "/default-avatar.png";

  useEffect(() => {
    const category = location.state as
      | {
          category_id?: number;
          category_name?: string;
        }
      | undefined;

    if (category?.category_id && category?.category_name) {
      setActiveCategory(category.category_name);
      setActiveCategoryId(category.category_id);
      return;
    }

    setActiveCategory("All");
    setActiveCategoryId(0);
  }, [location.state]);

  useEffect(() => {
    if (activeCategoryId !== 0) return;

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
  }, [activeCategoryId]);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category.category_name);
    setActiveCategoryId(category.category_id);
  };

  const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="aspect-video w-full rounded-xl bg-zinc-800" />
      <div className="mt-3 h-4 w-4/5 rounded bg-zinc-800" />
      <div className="mt-2 h-3 w-2/5 rounded bg-zinc-800" />
    </div>
  );

  const renderContent = () => {
    if (activeCategoryId !== 0) {
      return (
        <CategoryVideos
          categoryId={activeCategoryId}
          title={activeCategory}
        />
      );
    }

    if (loadingVideos) {
      return (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      );
    }

    if (videos.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                <h3 className="line-clamp-2 text-sm font-semibold text-white sm:text-base">
                  {video.title || "Untitled Video"}
                </h3>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="py-6 text-sm text-slate-400">
        No trending videos available.
      </div>
    );
  };

  return (
    <section className="w-full text-white">
      <div className="mx-auto w-full max-w-[1600px]">
        <section className="mb-3 sm:mb-4">
          <Categories
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </section>

        <section className="px-4 py-5 sm:px-8 lg:px-12">
          {renderContent()}
        </section>
      </div>
    </section>
  );
};

export default Trendsvideos;