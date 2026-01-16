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
      className="bg-white shadow rounded-xl cursor-pointer hover:shadow-lg transition p-2
      dark:bg-gray-800 dark:border-gray-700"
      onClick={onClick}
    >
      <div className="relative"> 
        <img
          src={thumbnail || "/default-avatar.png"}
          alt={videoTitle}
          className="w-full h-44 object-cover rounded-xl"
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

        {/* ACTION BUTTONs */}
        {/* {isPaid ? (
          canBuy ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuy?.();
              }}
              className="px-3 py-1 rounded-lg text-white dark:text-[#05333a]  font-semibold bg-[#05333a] dark:bg-[#e0e327]"
              
            >
              Buy
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddMoney?.();
              }}
              className="px-3 py-1 rounded-lg text-white font-semibold bg-orange-600 hover:bg-orange-700"
            >
              Top Up
            </button>
          )
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="px-3 py-1 rounded-lg text-white  dark:text-[#05333a] bg-[#05333a] dark:bg-[#e0e327] font-semibold"
            
          >
            Watch
          </button>
        ) }
        */}
      </div>
    </div>
  );
};

export default CardDataStatsPur;
