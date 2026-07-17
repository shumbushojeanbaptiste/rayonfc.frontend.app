import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Plyr, { Options } from "plyr";
import Hls, { HlsConfig, Events as HlsEvents, ErrorTypes as HlsErrorTypes } from "hls.js";
import * as dashjs from "dashjs";
import "plyr/dist/plyr.css";

/**
 * UniversalPlayer
 * ---------------
 * Supports:
 *  - Direct progressive files: mp4, webm, ogg
 *  - HLS (.m3u8, or any URL/mime that is actually HLS — see `type` prop)
 *  - MPEG-DASH (.mpd, or any URL/mime that is actually DASH)
 *  - YouTube / Vimeo / Twitch (iframe embeds)
 *  - Subtitles/captions (VTT tracks)
 *  - Multiple audio tracks (HLS/DASH)
 *  - Manual quality selection wired into Plyr's settings menu
 *  - Live reconnect handling with bounded retries instead of infinite silent retry
 *  - Basic DRM passthrough for HLS (FairPlay/Widevine via EME) and DASH
 *    (Widevine/PlayReady) — you MUST supply your own license server; this
 *    only wires the config through, it does not implement a license service.
 *
 * IMPORTANT: URL-extension sniffing is unreliable with signed/tokenized CDN
 * URLs (Mux, Cloudflare Stream, MediaPackage, etc.) that don't end in
 * .m3u8/.mpd. Whenever you know the real type, pass the `type` prop
 * explicitly ("hls" | "dash" | "mp4" | "youtube" | "vimeo" | "twitch") and
 * it will skip sniffing entirely.
 */

export interface Track {
  kind: "subtitles" | "captions";
  src: string;
  srcLang: string;
  label: string;
  default?: boolean;
}

export interface DrmConfig {
  // HLS (hls.js) — FairPlay / Widevine via EME
  widevineLicenseUrl?: string;
  fairplayLicenseUrl?: string;
  fairplayCertificateUrl?: string;
  // DASH (dash.js) — Widevine / PlayReady
  dashProtectionData?: dashjs.ProtectionDataSet;
}

type SourceType =
  | "hls"
  | "dash"
  | "mp4"
  | "youtube"
  | "vimeo"
  | "twitch"
  | "auto";

interface Props {
  src: string;
  type?: SourceType; // explicit override — always prefer this over sniffing
  live?: boolean;
  viewers?: number;
  autoPlay?: boolean;
  muted?: boolean;
  poster?: string;
  className?: string;
  tracks?: Track[];
  drm?: DrmConfig;
  maxReconnectAttempts?: number; // default 5, live streams only
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * dash.js ships TypeScript types that lag behind its actual runtime API —
 * `streaming.lowLatencyEnabled`, `streaming.liveCatchup`,
 * `getBitrateInfoListFor`, and `setQualityFor` all exist and are documented
 * in dash.js itself, but aren't always present in the installed @types.
 * This patches just the shape we use so the rest of the file stays fully
 * typed instead of reaching for `any` everywhere.
 */
interface DashSettingsPatch {
  streaming?: {
    lowLatencyEnabled?: boolean;
    liveCatchup?: {
      enabled?: boolean;
      maxDrift?: number;
    };
    abr?: {
      autoSwitchBitrate?: { video?: boolean; audio?: boolean };
    };
  };
}

interface DashPlayerPatch {
  updateSettings(settings: DashSettingsPatch): void;
  getBitrateInfoListFor(type: "video" | "audio"): unknown[];
  setQualityFor(type: "video" | "audio", value: number): void;
}

const patchedDash = (player: dashjs.MediaPlayerClass) =>
  player as unknown as dashjs.MediaPlayerClass & DashPlayerPatch;

const UniversalPlayer: React.FC<Props> = ({
  src,
  type = "auto",
  live = false,
  viewers,
  autoPlay = false,
  muted = false,
  poster,
  className = "",
  tracks = [],
  drm,
  maxReconnectAttempts = 5,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const dashRef = useRef<dashjs.MediaPlayerClass | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false);

  // ---- Source classification -------------------------------------------
  const detected: SourceType = useMemo(() => {
    if (type !== "auto") return type;
    if (/youtube\.com|youtu\.be/.test(src)) return "youtube";
    if (/twitch\.tv/.test(src)) return "twitch";
    if (/vimeo\.com/.test(src)) return "vimeo";
    // .m3u8/.mpd anywhere in the path OR query (covers signed/tokenized URLs)
    if (/\.m3u8(\?|$|#)/i.test(src) || /[?&]format=m3u8/i.test(src)) return "hls";
    if (/\.mpd(\?|$|#)/i.test(src) || /[?&]format=mpd/i.test(src)) return "dash";
    return "mp4";
  }, [src, type]);

  const isEmbed = detected === "youtube" || detected === "vimeo" || detected === "twitch";

  // ---- Cleanup ------------------------------------------------------------
  const clearReconnectTimer = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  const destroyAll = useCallback(() => {
    clearReconnectTimer();
    reconnectAttempts.current = 0;
    setReconnecting(false);

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (dashRef.current) {
      dashRef.current.reset();
      dashRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
  }, []);

  // ---- Embed URL builders --------------------------------------------------
  const getYoutubeEmbedUrl = (url: string) => {
    try {
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
      }
      const parsed = new URL(url);
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
      return url;
    } catch {
      return url;
    }
  };

  const getVimeoEmbedUrl = (url: string) => {
    try {
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match?.[1]) return `https://player.vimeo.com/video/${match[1]}`;
      return url;
    } catch {
      return url;
    }
  };

  const getTwitchEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split("/").filter(Boolean);
      const channel = parts[0];
      const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";
      if (channel) return `https://player.twitch.tv/?channel=${channel}&parent=${parent}`;
      return url;
    } catch {
      return url;
    }
  };

  // ---- Plyr quality/audio menu wiring (HLS) --------------------------------
  const wireHlsQualityMenu = (hls: Hls, plyrOptions: Options) => {
    const levels = hls.levels;
    if (!levels || levels.length <= 1) return plyrOptions;

    const qualities = levels.map((_, i) => i).reverse();
    const qualityOptions: Options["quality"] = {
      default: -1, // -1 = auto (ABR)
      options: [-1, ...qualities],
      forced: true,
      onChange: (quality: number) => {
        hls.currentLevel = quality;
      },
    };

    return {
      ...plyrOptions,
      quality: qualityOptions,
      i18n: {
        qualityLabel: {
          "-1": "Auto",
        } as Record<string, string>,
      },
    };
  };

  // ---- Init Plyr once media is ready --------------------------------------
  const initPlyr = useCallback(
    (extraOptions: Options = {}) => {
      if (!videoRef.current) return;

      const baseOptions: Options = {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "captions",
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
        captions: { active: tracks.some((t) => t.default), update: true },
        ...extraOptions,
      };

      playerRef.current = new Plyr(videoRef.current, baseOptions);

      if (autoPlay) {
        videoRef.current.play().catch((err) => {
          console.warn("Autoplay blocked by browser:", err);
        });
      }
    },
    [autoPlay, muted, tracks]
  );

  // ---- Bounded reconnect for live streams ---------------------------------
  const attemptReconnect = useCallback(
    (retryFn: () => void) => {
      if (!live) return; // only auto-reconnect for live content
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setErrorMessage("Lost connection to the live stream. Please refresh to try again.");
        setReconnecting(false);
        return;
      }
      reconnectAttempts.current += 1;
      setReconnecting(true);
      const backoffMs = Math.min(1000 * 2 ** reconnectAttempts.current, 15000);
      clearReconnectTimer();
      reconnectTimer.current = setTimeout(() => {
        retryFn();
      }, backoffMs);
    },
    [live, maxReconnectAttempts]
  );

  // ---- Main effect: attach the right engine for the detected type ---------
  useEffect(() => {
    setErrorMessage(null);
    if (!videoRef.current || isEmbed) return;

    const video = videoRef.current;
    destroyAll();

    // Attach caption/subtitle tracks declaratively via <track> elements below;
    // nothing extra needed here for those.

    if (detected === "hls") {
      if (Hls.isSupported()) {
        const hlsConfig: Partial<HlsConfig> = {
          enableWorker: true,
          lowLatencyMode: live,
          backBufferLength: 90,
          liveSyncDurationCount: live ? 3 : undefined,
          maxLiveSyncPlaybackRate: live ? 1.1 : undefined,
        };

        if (drm?.widevineLicenseUrl || drm?.fairplayLicenseUrl) {
          // hls.js EME support (widevine on Chrome/Firefox/Edge; fairplay needs
          // additional cert handling — see hls.js docs for `emeEnabled` +
          // `drmSystems`). You must run your own license proxy server.
          Object.assign(hlsConfig, {
            emeEnabled: true,
            drmSystems: {
              ...(drm.widevineLicenseUrl && {
                "com.widevine.alpha": { licenseUrl: drm.widevineLicenseUrl },
              }),
              ...(drm.fairplayLicenseUrl && {
                "com.apple.fps.1_0": {
                  licenseUrl: drm.fairplayLicenseUrl,
                  serverCertificateUrl: drm.fairplayCertificateUrl,
                },
              }),
            },
          });
        }

        const hls = new Hls(hlsConfig);
        hlsRef.current = hls;

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(HlsEvents.MANIFEST_PARSED, () => {
          reconnectAttempts.current = 0;
          setReconnecting(false);
          setErrorMessage(null);
          initPlyr(wireHlsQualityMenu(hls, {}));
        });

        hls.on(HlsEvents.ERROR, (_event, data) => {
          console.error("HLS error:", data);
          if (!data.fatal) return;

          switch (data.type) {
            case HlsErrorTypes.NETWORK_ERROR:
              attemptReconnect(() => {
                hls.startLoad();
              });
              break;
            case HlsErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setErrorMessage("Playback error — this stream could not be loaded.");
              hls.destroy();
              hlsRef.current = null;
              break;
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS
        video.src = src;
        video.addEventListener("loadedmetadata", () => initPlyr(), { once: true });
        video.addEventListener("error", () => {
          setErrorMessage("This stream could not be played in this browser.");
        });
      } else {
        setErrorMessage("Your browser does not support HLS playback.");
      }
    } else if (detected === "dash") {
      if (dashjs.supportsMediaSource()) {
        const dashPlayer = dashjs.MediaPlayer().create();
        dashRef.current = dashPlayer;

        if (drm?.dashProtectionData) {
          dashPlayer.setProtectionData(drm.dashProtectionData);
        }

        patchedDash(dashPlayer).updateSettings({
          streaming: {
            lowLatencyEnabled: live,
            ...(live ? { liveCatchup: { enabled: true, maxDrift: 6 } } : {}),
          },
        });

        dashPlayer.initialize(video, src, autoPlay);

        dashPlayer.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
          reconnectAttempts.current = 0;
          setReconnecting(false);
          setErrorMessage(null);

          const bitrates = patchedDash(dashPlayer).getBitrateInfoListFor("video") || [];
          const qualityOptions: Options["quality"] =
            bitrates.length > 1
              ? {
                  default: -1,
                  options: [-1, ...bitrates.map((_, i) => i)],
                  forced: true,
                  onChange: (q: number) => {
                    const dp = patchedDash(dashPlayer);
                    if (q === -1) {
                      dp.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: true } } } });
                    } else {
                      dp.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: false } } } });
                      dp.setQualityFor("video", q);
                    }
                  },
                }
              : undefined;

          initPlyr(qualityOptions ? { quality: qualityOptions } : {});
        });

        dashPlayer.on(dashjs.MediaPlayer.events.ERROR, (e: any) => {
          console.error("DASH error:", e);
          attemptReconnect(() => {
            dashPlayer.attachSource(src);
          });
        });
      } else {
        setErrorMessage("Your browser does not support DASH playback.");
      }
    } else if (detected === "mp4") {
      video.src = src;
      video.addEventListener("loadedmetadata", () => initPlyr(), { once: true });
      video.addEventListener("error", () => {
        setErrorMessage("This video could not be loaded or is an unsupported format.");
      });
    }

    return () => {
      destroyAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, detected, autoPlay, muted, live, drm]);

  // ---- Embeds ---------------------------------------------------------------
  if (detected === "youtube") {
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

  if (detected === "vimeo") {
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

  if (detected === "twitch") {
    return (
      <div className={`relative w-full ${className}`}>
        <iframe
          className="w-full aspect-video rounded-xl"
          src={getTwitchEmbedUrl(src)}
          title="Twitch player"
          allowFullScreen
        />
        {live && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            LIVE
          </div>
        )}
      </div>
    );
  }

  // ---- Native / HLS / DASH ----------------------------------------------
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

      {reconnecting && !errorMessage && (
        <div className="absolute inset-x-0 top-3 z-10 mx-auto w-fit rounded bg-yellow-600/90 px-3 py-1 text-xs font-medium text-white">
          Reconnecting to stream…
        </div>
      )}

      {errorMessage && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/85 p-4 text-center text-sm text-white">
          {errorMessage}
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
        onContextMenu={(e) => e.preventDefault()}
      >
        {tracks.map((t, i) => (
          <track
            key={`${t.srcLang}-${i}`}
            kind={t.kind}
            src={t.src}
            srcLang={t.srcLang}
            label={t.label}
            default={t.default}
          />
        ))}
      </video>
    </div>
  );
};

export default UniversalPlayer;
