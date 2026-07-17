import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { Video } from "../types/videouser";
import { encodeId } from "../utils/hashid";
import Categories, { Category } from "../components/categories/Categories";
import CategoryVideos from "./CategoryVideos";

const Latestvideos: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeCategoryId, setActiveCategoryId] = useState<number>(0);

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
  }, [activeCategoryId]);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category.category_name);
    setActiveCategoryId(category.category_id);
  };

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

                <div className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase">
                  New
                </div>

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
      <div className="py-6 text-sm text-gray-400">
        No latest videos available.
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
          {/* <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              {activeCategoryId === 0 ? "Latest Videos" : activeCategory}
            </h2>
          </div> */}

          {renderContent()}
        </section>
      </div>
    </section>
  );
};

export default Latestvideos;