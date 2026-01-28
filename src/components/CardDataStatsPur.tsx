import React from "react";

interface Props {
  id: number;
  videoTitle: string;
  channelName: string;
  total: string;
  price?: number | string | null;
  thumbnail?: string;
  profileImage?: string;
  onClick?: () => void;
  onBuy?: () => void;
  onAddMoney?: () => void;
  canBuy?: boolean;
}

const CardDataStatsPur: React.FC<Props> = ({
  videoTitle,
  channelName,
  total,
  price,
  thumbnail,
  profileImage,
  onClick,
  onBuy,
  onAddMoney,
  canBuy = false,
}) => {
  


  const numericPrice = Number(price || 0);
  const isPaid = numericPrice > 0;

  return (
    <div
      className=" rounded-xl cursor-pointer hover:shadow-md p-2 group transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative "> 
        <img
          src={thumbnail || "/default-avatar.png"}
          alt={videoTitle}
          className="w-full h-44 object-cover rounded-xl "
        />

        {isPaid && (
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded">
            {numericPrice.toFixed(2)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-2">
        <img
          src={profileImage || "/default-avatar.png"}
          alt={channelName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
            {videoTitle}
          </h3>
          <p className="text-sm text-gray-600 dark:text-white line-clamp-1">
            {channelName}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-gray-600 dark:text-white">{total}</p>

      </div>
    </div>
  );
};

export default CardDataStatsPur;  
