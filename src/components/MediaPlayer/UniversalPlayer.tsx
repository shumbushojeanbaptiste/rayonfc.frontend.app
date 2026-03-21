import React, { useEffect, useMemo, useRef, useState } from "react";
import Plyr from "plyr";
import Hls from "hls.js";
import "plyr/dist/plyr.css";

interface Props {
  src: string;
  live?: boolean;
  viewers?: number;
  onEnded?: () => void;
  poster?: string;
  muted?: boolean;
  autoPlay?: boolean;
}

const UniversalPlayer: React.FC<Props> = ({
  src,
  live = false,
  viewers,
  onEnded,
  poster,
  muted = false,
  autoPlay = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [playerError, setPlayerError] = useState<string>("");

  const cleanSrc = useMemo(() => (src || "").trim(), [src]);

  const isYoutube = /youtube\.com|youtu\.be/.test(cleanSrc);
  const isTwitch = /twitch/.test(cleanSrc);
  const isVimeo = /vimeo/.test(cleanSrc);
  const isHls = /\.m3u8($|\?)/i.test(cleanSrc);

  const getYoutubeId = (url: string) => {
    try {
      if (url.includes("youtu.be/")) {
        return url.split("youtu.be/")[1]?.split("?")[0];
      }

      if (url.includes("watch?v=")) {
        return url.split("watch?v=")[1]?.split("&")[0];
      }

      if (url.includes("/embed/")) {
        return url.split("/embed/")[1]?.split("?")[0];
      }

      return "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (!videoRef.current || isYoutube || isTwitch || isVimeo || !cleanSrc) return;

    const video = videoRef.current;
    setPlayerError("");

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hlsRef.current = hls;

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log("HLS media attached");
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed");
          if (autoPlay) {
            video.play().catch((err) => {
              console.warn("Autoplay failed:", err);
            });
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.error("HLS error:", data);

          if (data?.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setPlayerError("Network error while loading live stream.");
                hls.startLoad();
                break;

              case Hls.ErrorTypes.MEDIA_ERROR:
                setPlayerError("Media error while playing stream.");
                hls.recoverMediaError();
                break;

              default:
                setPlayerError("Unable to play this stream.");
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });

        hls.loadSource(cleanSrc);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = cleanSrc;
      } else {
        setPlayerError("This browser does not support HLS playback.");
      }
    } else {
      video.src = cleanSrc;
    }

    const player = new Plyr(video, {
      controls: live
        ? ["play", "mute", "volume", "settings", "fullscreen"]
        : ["play", "progress", "current-time", "mute", "volume", "settings", "fullscreen"],
      autoplay: autoPlay,
      muted,
      fullscreen: { enabled: true, fallback: true, iosNative: true },
      youtube: { noCookie: true, rel: 0 },
    });

    playerRef.current = player;

    const handleNativeError = () => {
      const mediaError = video.error;
      if (!mediaError) return;

      console.error("Native video error:", mediaError);
      setPlayerError("Video failed to load.");
    };

    video.addEventListener("error", handleNativeError);

    return () => {
      video.removeEventListener("error", handleNativeError);

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [cleanSrc, isYoutube, isTwitch, isVimeo, isHls, autoPlay, muted, live]);

  if (!cleanSrc) {
    return (
      <div className="w-full aspect-video flex items-center justify-center bg-black text-white">
        No video source provided.
      </div>
    );
  }

  if (isYoutube) {
    const id = getYoutubeId(cleanSrc);

    if (!id) {
      return (
        <div className="w-full aspect-video flex items-center justify-center bg-black text-white">
          Invalid YouTube URL.
        </div>
      );
    }

    return (
      <iframe
        className="w-full aspect-video"
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video player"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (isTwitch || isVimeo) {
    return (
      <iframe
        src={cleanSrc}
        className="w-full aspect-video"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title="Embedded player"
      />
    );
  }

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden">
      {live && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE
        </div>
      )}

      {live && viewers !== undefined && (
        <div className="absolute top-3 right-3 z-10 bg-black/70 text-white px-2 py-1 rounded text-xs">
          👁 {viewers}
        </div>
      )}

      <video
        ref={videoRef}
        className="plyr w-full"
        playsInline
        controls
        autoPlay={autoPlay}
        muted={muted}
        poster={poster}
        onEnded={onEnded}
        onContextMenu={(e) => e.preventDefault()}
      />

      {playerError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-sm px-4 text-center">
          {playerError}
        </div>
      )}
    </div>
  );
};

export default UniversalPlayer;