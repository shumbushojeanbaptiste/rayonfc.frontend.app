import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";
import api from "../api";
import { Video } from "../types/videouser";
import CardDataStatsLat from "../components/CardDataStatsLat";

const Latestvideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
 
  const navigate = useNavigate();
  const ACCENT = "#05333a"; 

  /* -----------------------------
     LOAD VIDEOS
  ------------------------------*/
  useEffect(() => {
    api
      .get("/api/accessible/latest-video")
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
      <Breadcrumb pageName="Latest Videos" />

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video: any, idx: number) => {
           
           //console.log("VIDEO OBJECT:", video);
     
          return (
            <div
              key={`${video.id}-${idx}`}
              style={{ borderLeft: "5px solid transparent" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderLeft = `5px solid ${ACCENT}`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderLeft = "5px solid transparent")
              }
            >
              <CardDataStatsLat
                id={video.id}
                videoTitle={video.title}
                channelName={video.owner_name || "Unknown Owner"}
                total={`${video.views ?? 0} views`}
                //price={video.price}
                thumbnail={fileUrl(video.thumbnail)}
                profileImage={fileUrl(video.profile_photo)}
                onClick={() =>  navigate(`/watch/${video.id}`, {
                  state: video, // pass the full video object
                })}
                
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Latestvideos;
