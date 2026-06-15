import React from "react";

interface Props {
  id: number;
  videoTitle: string;
  channelName: string;
  total: string;
  duration: string;
  price?: number | string | null;
  thumbnail?: string;
  profileImage?: string;
  onClick: () => void;
}

const CardDataStatsMusic: React.FC<Props> = ({
  videoTitle,
  channelName,
  total,
  duration,
  price,
  thumbnail,
  onClick,
}) => {
  const numericPrice = Number(price ?? 0);
  const isPaid = numericPrice > 0;

  const safeThumbnail =
    thumbnail && thumbnail !== "null" && thumbnail !== "undefined"
      ? thumbnail
      : "/default-avatar.png";

  return (
    <div
      onClick={onClick}
      className="group relative flex-shrink-0 w-[260px] sm:w-[320px] md:w-[400px] cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-md bg-zinc-900">
        <img
          src={safeThumbnail}
          alt={videoTitle || "Video thumbnail"}
          className="w-full h-[145px] sm:h-[175px] md:h-[220px] object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        <div className="absolute top-3 right-3 rounded bg-black/75 px-2 py-1 text-[11px] sm:text-xs text-white">
          {duration || "--"}
        </div>

        {/* Uncomment this if you want paid badge back
        {isPaid && (
          <div className="absolute bottom-3 right-3 rounded bg-black/75 px-2 py-1 text-[11px] sm:text-xs text-white">
            {numericPrice.toFixed(0)} RWF
          </div>
        )}
        */}
      </div>

      <div className="pt-2">
        <h3 className="font-canal text-white text-[14px] sm:text-[15px] md:text-[17px] font-semibold leading-tight tracking-tight line-clamp-2 transition-colors duration-200">
          {videoTitle || "Untitled Video"}
        </h3>

        <p className="font-canal mt-1 text-gray-400 text-[12px] sm:text-[13px] md:text-[14px] leading-none line-clamp-1">
          {channelName || "Unknown Artist"}
        </p>

        {/* Uncomment this if you want views back
        <p className="font-canal mt-1 text-gray-500 text-[11px] sm:text-xs md:text-sm line-clamp-1">
          {total}
        </p>
        */}
      </div>
    </div>
  );
};

export default CardDataStatsMusic;