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
 
const CardLive: React.FC<Props> = ({
  videoTitle,
  channelName,
  total,
  duration,
  price,
  thumbnail,
  profileImage,
  onClick,
}) => {
  const numericPrice = Number(price || 0);
  const isPaid = numericPrice > 0;

  return (

   <div className="hover:bg-blue-100 rounded-xl p-3 transition-colors duration-200">
  <div
  onClick={onClick}
  className="group rounded-xl cursor-pointer transition duration-200 "
  >
      {/* THUMBNAIL */}
      <div className="relative overflow-hidden rounded-xl">

        <img
          src={thumbnail || "/default-avatar.png"}
          alt={videoTitle}
          className="w-full h-44 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
        />

        {/* LIVE BADGE */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE
        </div>

        {/* DURATION 
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {duration}
        </div> */}

      </div>

      {/* PROFILE SECTION */}
      <div className="flex items-start gap-3 mt-3">

<div className="relative w-10 h-10">
  <img
    src={profileImage || "/default-avatar.png"}
    alt={channelName}
    className="w-10 h-10 rounded-full object-cover border-2 border-white ring-2 ring-red-500"
  />

  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] px-1 py-[0.5px] rounded-sm font-semibold flex items-center gap-[2px] leading-none">
  <span className="w-[3px] h-[3px] bg-white rounded-full animate-pulse"></span>
  LIVE
</div>
</div>

        <div className="flex-1">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-red-600 transition">
            {videoTitle}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-1">
            {channelName}
          </p>

          {/* LIVE VIEWERS */}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {total}
            </span>

            {isPaid && (
              <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs">
                {numericPrice.toFixed(2)} RWF
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
</div>

  );
};

export default CardLive;