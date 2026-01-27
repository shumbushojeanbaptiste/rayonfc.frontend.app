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
  profileImage,
  onClick,
}) => {
  const numericPrice = Number(price ?? 0);
  const isPaid = numericPrice > 0;

  const safeThumbnail =
    thumbnail && thumbnail !== "null" && thumbnail !== "undefined"
      ? thumbnail
      : "/default-avatar.png";

  const safeProfileImage =
    profileImage && profileImage !== "null" && profileImage !== "undefined"
      ? profileImage
      : safeThumbnail;

  return (
    <div
      onClick={onClick}
      className="rounded-xl cursor-pointer hover:shadow-md p-2 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
    >
      <div className="relative">
        <img
          src={safeThumbnail}
          alt={videoTitle || "Video thumbnail"}
          className="w-full h-44 object-cover rounded-xl"
        />

        {/* Duration */}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
          {duration || "--"}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <img
          src={safeProfileImage}
          alt={channelName || "Channel"}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="flex-1">
          <h3 className="font-semibold line-clamp-1">
            {videoTitle || "Untitled Video"}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-1">
            {channelName || "Unknown Artist"}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
        <span>{total}</span>

        {isPaid && (
          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">
            {numericPrice.toFixed(2)} RWF
          </span>
        )}
      </div>
    </div>
  );
};

export default CardDataStatsMusic;
