import React, { useEffect, useMemo, useRef } from "react";
import Plyr, { Options } from "plyr";
import Hls from "hls.js";
import "plyr/dist/plyr.css";

interface Props {
  src: string;
  live?: boolean;
  viewers?: number;
  autoPlay?: boolean;
  muted?: boolean;
  poster?: string;
  className?: string;
}

const UniversalPlayer: React.FC<Props> = ({
  src,
  live = false,
  viewers,
  autoPlay = false,
  muted = false,
  poster,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const isYoutube = useMemo(() => /youtube\.com|youtu\.be/.test(src), [src]);
  const isTwitch = useMemo(() => /twitch\.tv/.test(src), [src]);
  const isVimeo = useMemo(() => /vimeo\.com/.test(src), [src]);
  const isHls = useMemo(() => /\.m3u8($|\?)/.test(src), [src]);

  const destroyAll = () => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
      }

      const parsed = new URL(url);
      const id = parsed.searchParams.get("v");
      if (id) {
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
      }

      return url;
    } catch {
      return url;
    }
  };

  const getVimeoEmbedUrl = (url: string) => {
    try {
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match?.[1]) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const getTwitchEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url);

      // Example:
      // https://www.twitch.tv/channelname
      const parts = parsed.pathname.split("/").filter(Boolean);
      const channel = parts[0];

      // IMPORTANT:
      // Replace "localhost" with your real domain in production
      const parent =
        typeof window !== "undefined"
          ? window.location.hostname
          : "localhost";

      if (channel) {
        return `https://player.twitch.tv/?channel=${channel}&parent=${parent}`;
      }

      return url;
    } catch {
      return url;
    }
  };

  useEffect(() => {
    if (!videoRef.current || isYoutube || isTwitch || isVimeo) return;

    const video = videoRef.current;

    destroyAll();

    const plyrOptions: Options = {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "pip",
        "airplay",
        "fullscreen",
      ],
      autoplay: autoPlay,
      muted,
      resetOnEnd: false,
      clickToPlay: true,
      keyboard: { focused: true, global: false },
    };

    const initPlyr = () => {
      if (!videoRef.current) return;

      playerRef.current = new Plyr(videoRef.current, plyrOptions);

      if (autoPlay) {
        const playPromise = videoRef.current.play();
        if (playPromise) {
          playPromise.catch((err) => {
            console.warn("Autoplay blocked by browser:", err);
          });
        }
      }
    };

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: live,
          backBufferLength: 90,
        });

        hlsRef.current = hls;

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          initPlyr();
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.error("HLS error:", data);

          if (!hlsRef.current) return;

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn("Fatal network error. Trying to recover...");
                hlsRef.current.startLoad();
                break;

              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn("Fatal media error. Trying to recover...");
                hlsRef.current.recoverMediaError();
                break;

              default:
                console.warn("Unrecoverable HLS error. Destroying...");
                hlsRef.current.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS support
        video.src = src;
        video.addEventListener(
          "loadedmetadata",
          () => {
            initPlyr();
          },
          { once: true }
        );
      } else {
        console.error("This browser does not support HLS.");
      }
    } else {
      video.src = src;
      video.addEventListener(
        "loadedmetadata",
        () => {
          initPlyr();
        },
        { once: true }
      );
    }

    return () => {
      destroyAll();
    };
  }, [src, autoPlay, muted, live, isYoutube, isTwitch, isVimeo, isHls]);

  if (isYoutube) {
    return (
      <div className={`relative w-full ${className}`}>
        <iframe
          className="w-full aspect-video rounded-xl"
          src={getYoutubeEmbedUrl(src)}
          title="YouTube player"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (isVimeo) {
    return (
      <div className={`relative w-full ${className}`}>
        <iframe
          className="w-full aspect-video rounded-xl"
          src={getVimeoEmbedUrl(src)}
          title="Vimeo player"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (isTwitch) {
    return (
      <div className={`relative w-full ${className}`}>
        <iframe
          className="w-full aspect-video rounded-xl"
          src={getTwitchEmbedUrl(src)}
          title="Twitch player"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {live && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          LIVE
        </div>
      )}

      {live && viewers !== undefined && (
        <div className="absolute top-3 right-3 z-10 rounded bg-black/70 px-2 py-1 text-xs text-white">
          👁 {viewers}
        </div>
      )}

      <video
        ref={videoRef}
        className="plyr w-full aspect-video rounded-xl bg-black"
        playsInline
        controls
        autoPlay={autoPlay}
        muted={muted}
        poster={poster}
        preload="metadata"
        crossOrigin="anonymous"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};

export default UniversalPlayer;