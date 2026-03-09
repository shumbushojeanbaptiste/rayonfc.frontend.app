import React, { useEffect, useRef } from "react";
import Plyr from "plyr";
import Hls from "hls.js";
import "plyr/dist/plyr.css";

interface Props {
  src: string;
  live?: boolean;
  viewers?: number;
}

const UniversalPlayer: React.FC<Props> = ({ src, live, viewers }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const isYoutube = /youtube\.com|youtu\.be/.test(src);
  const isTwitch = src.includes("twitch");
  const isVimeo = src.includes("vimeo");

  useEffect(() => {
    if (!videoRef.current || isYoutube || isTwitch || isVimeo) return;

    const video = videoRef.current;

    if (src.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
        });

        hls.loadSource(src);
        hls.attachMedia(video);

      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }
    } else {
      video.src = src;
    }

    const player = new Plyr(video, {
      controls: [
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "fullscreen"
      ]
    });

    return () => {
      player.destroy();
    };
  }, [src]);

  if (isYoutube) {
    const id = src.includes("v=")
      ? src.split("v=")[1].split("&")[0]
      : src.split("/").pop();

    return (
      <iframe
        className="w-full aspect-video"
        src={`https://www.youtube.com/embed/${id}`}
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    );
  }

  if (isTwitch || isVimeo) {
    return (
      <iframe
        src={src}
        className="w-full aspect-video"
        allowFullScreen
      />
    );
  }

  return (
    <div className="relative w-full">

      {/* LIVE BADGE 
      {live && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE
        </div>
      )}*/}

      {/* VIEWERS 
      {live && viewers !== undefined && (
        <div className="absolute top-3 right-3 z-10 bg-black/70 text-white px-2 py-1 rounded text-xs">
          👁 {viewers}
        </div>
      )}*/}

<video
  ref={videoRef}
  className="plyr w-full"
  playsInline
  controls
  autoPlay
/>

    </div>
  );
};

export default UniversalPlayer;