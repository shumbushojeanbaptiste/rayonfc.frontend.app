import React, { useEffect, useRef } from "react";
import Plyr from "plyr";
import Hls from "hls.js";

interface Props {
  src: string;
}

const LivePlayer: React.FC<Props> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = new Plyr(videoRef.current, {
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

    if (src.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
      } else {
        videoRef.current.src = src;
      }
    } else {
      videoRef.current.src = src;
    }

    return () => {
      player.destroy();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="plyr-react plyr"
      playsInline
      controls
    />
  );
};

export default LivePlayer;