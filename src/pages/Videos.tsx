import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import api from "../api";
import CardDataStats from "../components/CardDataStats";
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb";


const Allvideos: React.FC = () => {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate(); 

  const ACCENT = "#05333a"; 
 
  // Updated fallback logic (NO MORE default.png from backend!)
  const fileUrl = (path: string) => {
    if (!path) return "/default-avatar.png"; // <— FIXED

    // If backend returns only filename, add uploads folder
    if (!path.includes("/")) {
      path = `${path}`;
    }

    return `${path}`;
  };

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const res = await api.get("/api/videos/allVideos");
        setVideos(res.data.data);
      } catch (err) {
        console.error("FAILED TO LOAD VIDEOS:", err);
      }
    };

    loadVideos();
  }, []);

 
  return (
    <>

      <Breadcrumb pageName="" /> 
    <div
      className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
    >
      {videos.map((video: any, idx: number) => {
        const ownerName = `${video.first_name || ""} ${
          video.last_name || ""
        }`.trim();

        //console.log("VIDEO OBJECT:", video);

        return (
          
          <div
            key={`${video.video_id}-${idx}`}
            style={{
              borderLeft: `5px solid transparent`,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderLeft = `5px solid ${ACCENT}`)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderLeft = `5px solid transparent`)
            }
          >
            
            <CardDataStats
              id={video.video_id}
              videoTitle={video.title}
              channelName={ownerName || "Unknown Owner"}
              total={`${video.views_count} views`}
              periode={video.created_at}
              thumbnail={fileUrl(video.thumbnail)}
              profileImage={fileUrl(video.profile_photo)}
              onClick={() =>
                navigate(`/watch/${video.video_id}`, {
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

export default Allvideos;
