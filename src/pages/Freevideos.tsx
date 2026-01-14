import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import { Video } from "../types/videouser";
import CardDataStatsFree from "../components/CardDataStatsFree";
import { encodeId } from "../utils/hashid"; // ✅ ADDED

const Freevideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
 
  const navigate = useNavigate();
  const ACCENT = "#05333a";

  /* -----------------------------
     LOAD VIDEOS
  ------------------------------*/
  useEffect(() => {
    api
      .get("/api/accessible/free-videos")
      .then((res) => setVideos(res.data.data || []))
      .catch((err) => console.error("FAILED TO LOAD VIDEOS:", err));
  }, []);

  /* -----------------------------
     FILE URL
  ------------------------------*/
  const fileUrl = (path?: string) => {
    if (!path || path === "null" || path === "undefined") {
      return "/default-avatar.png";
    }
    return path.includes("/") ? path : `${path}`;
  };

  return (
    <>
      <Breadcrumb pageName="Free Videos" />

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {videos.map((video: any, idx: number) => {
          return (
            <div
              key={`${video.video_id}-${idx}`}
              style={{ borderLeft: "5px solid transparent" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderLeft = `5px solid ${ACCENT}`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderLeft = "5px solid transparent")
              }
            >
              <CardDataStatsFree
                id={video.video_id}
                videoTitle={video.title}
                total={`${video.views_count ?? 0} views`}
                price={video.price}
                thumbnail={fileUrl(video.thumbnail)}
                profileImage={fileUrl(video.profile_photo)}
                onClick={() =>
                  navigate(`/watch/${encodeId(video.video_id)}`, {
                    state: video, // pass the full video object
                  })
                }
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Freevideos;
