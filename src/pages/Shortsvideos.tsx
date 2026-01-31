import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import CardsDataStatshorts from "../components/CardsDataStatshorts";
import { encodeId } from "../utils/hashid";

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
  const navigate = useNavigate();

  /* -----------------------------
     LOAD SHORT VIDEOS
  ------------------------------*/
  useEffect(() => {
    api
      .get("/api/videos/shorts")
      .then((res) => {
        setVideos(res.data.data || []);
      })
      .catch((err) => {
        console.error("FAILED TO LOAD SHORT VIDEOS:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  /* -----------------------------
     WATCH SHORT
  ------------------------------*/
  const handleWatch = (video: ShortVideo) => {
    navigate(`/watch/${encodeId(video.id)}`, {
      state: {
        ...video,
        source: "shorts",
      },
    });
  };

  /* -----------------------------
     SKELETON
  ------------------------------*/
  const SkeletonCard = () => (
    <div className="rounded-xl p-2 animate-pulse">
      <div className="h-44 bg-gray-300 rounded-xl mb-3" />
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-300 rounded w-1/2" />
    </div>
  );

  return (
    <>
      <Breadcrumb pageName="" />
    <div className="p-2 md:p-4 2xl:p-8">
      <div className="px-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {loading
          ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
          : videos.map((video) => (
              <CardsDataStatshorts
                key={video.id} 
                id={video.id}
                title={video.title}
                owner={video.owner || "Unknown"}
                views={video.views}
                duration={video.duration}
                price={video.price}
                thumbnail={video.thumbnail}
                onClick={() => handleWatch(video)}
              />
            ))}
      </div>
      </div>
    </>
  );
};

export default Shortvideos;
