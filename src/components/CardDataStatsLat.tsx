import React from "react";

interface Props {
  id: number;
  videoTitle: string;
  channelName: string;
  total: string;
  duration?: string;
  price?: number | string | null;
  thumbnail?: string;
  profileImage?: string;
  onClick?: () => void;
  onBuy?: () => void;
  onAddMoney?: () => void;
  canBuy?: boolean;
}

const CardDataStatsLat: React.FC<Props> = ({
  videoTitle,
  channelName,
  total,
  duration,
  price,
  thumbnail,
  onClick,
}) => {
  const numericPrice = Number(price || 0);
  const isPaid = numericPrice > 0;

  return (
    <div
      onClick={onClick}
      className="group relative flex-shrink-0 w-[280px] sm:w-[340px] md:w-[440px] cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-md bg-zinc-900">
        <img
          src={thumbnail || "/default-avatar.png"}
          alt={videoTitle}
          className="w-full h-[170px] sm:h-[190px] md:h-[250px] object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        {duration && (
          <div className="absolute top-3 right-3 rounded bg-black/75 px-2 py-1 text-[11px] sm:text-xs text-white">
            {duration}
          </div>
        )}

        {/*{isPaid && (
          <div className="absolute bottom-3 right-3 rounded bg-black/75 px-2 py-1 text-[11px] sm:text-xs text-white">
            {numericPrice.toFixed(0)} RWF
          </div>
        )}*/}
      </div>

      <div className="pt-3">
        <h3 className="font-canal text-white text-[15px] xsm:text-[16px] md:text-[18px] font-semibold leading-tight tracking-tight line-clamp-2 transition-colors duration-200">
          {videoTitle}
        </h3>

        <p className="font-canal mt-2 text-gray-400 text-[12px] xsm:text-[13px] md:text-[15px] leading-none line-clamp-1">
          {channelName}
        </p>

        {/*<p className="font-canal mt-2 text-gray-500 text-[11px] sm:text-xs md:text-sm line-clamp-1">
          {total}
        </p>*/}
      </div>
    </div>
  );
};

export default CardDataStatsLat;