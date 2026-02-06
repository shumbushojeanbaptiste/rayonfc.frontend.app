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

const CardDataStatsChar: React.FC<Props> = ({
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
    <div
      onClick={onClick}
      className="rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:scale-[1.02]"
    >
      <div className="relative"> 
        <img
          src={thumbnail || "/default-avatar.png"}
          alt={videoTitle}
          className="w-full h-44 object-cover rounded-xl"
        />

        {/* Duration Badge (Shorts style) */}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {duration}
        </div>
      </div>

      {/* PROFILE SECTION — UNCHANGED */}
      <div className="flex items-center gap-3 mt-2">
        <img
          src={profileImage || "/default-avatar.png"}
          alt={channelName}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="flex-1">
          <h3 className="font-semibold line-clamp-1">{videoTitle}</h3>
          <p className="text-sm text-gray-400 line-clamp-1">{channelName}</p>
        </div>
      </div>

      <div className="flex gap-40 mt-2 text-sm text-gray-400">
        {total}

        {isPaid && (
          <div className="bg-gray-700 text-white px-2 py-1 rounded text-xs">
            {numericPrice.toFixed(2)} RWF
          </div>
        )} 
      </div>
    </div> 
  );
};

export default CardDataStatsChar; 
