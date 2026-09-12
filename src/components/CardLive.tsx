import React from "react";
import { Lock } from "lucide-react";

interface Props {
  id: number;
  videoTitle: string;
  channelName: string;
  total: string;
  duration: string;
  price?: number | string | null;
  thumbnail?: string;
  profileImage?: string;
  category?: string;
  canWatch?: boolean;
  requiresSubscription?: boolean;
  onClick: () => void;
}

const CardLive: React.FC<Props> = ({
  videoTitle,
  channelName,
  total,
  duration,
  price,
  thumbnail,
  category,
  canWatch,
  requiresSubscription,
  onClick,
}) => {
  const numericPrice = Number(price || 0);
  const isPaid = numericPrice > 0;

  /*
   * ONLY canWatch === true can watch the video.
   * Everything else is locked.
   */
  const isLocked = canWatch !== true;

  return (
    <div
      onClick={onClick}
      className={`group min-w-0 ${
        isLocked ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div className="overflow-hidden rounded-sm bg-black">

        {/* VIDEO THUMBNAIL */}
        <div className="relative overflow-hidden bg-neutral-900">

          <img
            src={thumbnail || "/default-avatar.png"}
            alt={videoTitle}
            className={`w-full h-[160px] xsm:h-[180px] sm:h-[210px] md:h-[230px] object-cover transition-transform duration-300 ${
              !isLocked ? "group-hover:scale-[1.03]" : ""
            } ${
              isLocked ? "brightness-[0.55]" : ""
            }`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* LIVE BADGE */}
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] md:text-[11px] font-bold px-2 py-1 rounded-sm shadow">
            LIVE
          </div>

          {/* RAYON TV */}
          <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-sm">
            RAYON TV
          </div>

          {/* LOCK OVERLAY */}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center">

              <div className="flex flex-col items-center justify-center">

                <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-black/80 border border-white/20 shadow-xl backdrop-blur-sm">
                  <Lock className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>

                <div className="mt-2 rounded-full bg-black/80 px-3 py-1.5 text-[10px] md:text-xs font-semibold text-white backdrop-blur-sm">
                  Subscribe to watch
                </div>

              </div>

            </div>
          )}

          {/* PAID PRICE */}
          {/*
          {isPaid && (
            <div className="absolute top-2 left-2 bg-black/75 text-white text-[9px] md:text-[10px] font-semibold px-2 py-1 rounded-sm">
              {numericPrice.toFixed(0)} RWF
            </div>
          )}
          */}

        </div>

        {/* CARD INFORMATION */}
        <div className="bg-black px-1 pt-3 md:pt-4 pb-4 md:pb-5">

          <div className="flex items-start justify-between gap-2">

            <h3
              className={`font-canal text-white text-[15px] xsm:text-[16px] md:text-[18px] font-semibold leading-tight tracking-tight line-clamp-2 transition-colors duration-200 ${
                !isLocked ? "group-hover:text-red-500" : ""
              }`}
            >
              {videoTitle}
            </h3>

            {/* SMALL LOCK ICON */}
            {isLocked && (
              <Lock className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-400" />
            )}

          </div>

          <p className="font-canal mt-2 text-gray-400 text-[12px] xsm:text-[13px] md:text-[15px] leading-none line-clamp-1">
            {category || channelName || "Live Sports"}
          </p>

          {/* SUBSCRIPTION MESSAGE */}
          {isLocked && (
            <p className="mt-2 text-[11px] md:text-xs font-medium text-red-400">
              Subscribe to watch this video
            </p>
          )}

        </div>
      </div>
    </div>
  );
};

export default CardLive;