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

const CardDataStatsTre: React.FC<Props> = ({
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
      <div className="relative overflow-hidden rounded-xl"> 
        <img
          src={thumbnail || "/default-avatar.png"}
          alt={videoTitle}
          className="w-full h-44 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
        />

        {/* Duration Badge (Shorts style) */}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {duration}
        </div> 
      </div>

      {/* PROFILE SECTION — UNCHANGED */}
      <div className="flex items-start gap-3 mt-3">
      <div className="relative w-10 h-10">
        <img
          src={profileImage || "/default-avatar.png"}
          alt={channelName}
          className="w-10 h-10 rounded-full object-cover"
        />

        
      </div>

      <div className="flex-1">
          <h3 className="font-semibold line-clamp-1">{videoTitle}</h3>
          <p className="text-sm text-gray-400 line-clamp-1">{channelName}</p>
          <div className="flex gap-40 mt-2 text-sm text-gray-400">
        {total}

        {isPaid && (
          <div className="bg-gray-700 text-white px-2 py-1 rounded text-xs">
            {numericPrice.toFixed(2)} RWF
          </div>
        )} 
      </div>
        </div>
     </div>
      
    </div> 
    </div>
  );
};

export default CardDataStatsTre; 
