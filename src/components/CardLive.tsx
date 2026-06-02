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
  category?: string;
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
  onClick,
}) => {
  const numericPrice = Number(price || 0);
  const isPaid = numericPrice > 0;

  return (
    <div onClick={onClick} className="group cursor-pointer min-w-0">
      <div className="overflow-hidden rounded-sm bg-black">
        <div className="relative overflow-hidden bg-neutral-900">
          <img
            src={thumbnail || "/default-avatar.png"}
            alt={videoTitle}
            className="w-full h-[160px] xsm:h-[180px] sm:h-[210px] md:h-[230px] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] md:text-[11px] font-bold px-2 py-1 rounded-sm shadow">
            LIVE
          </div>

          <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-sm">
            RAYON TV
          </div>

          {/*{isPaid && (
            <div className="absolute top-2 left-2 bg-black/75 text-white text-[9px] md:text-[10px] font-semibold px-2 py-1 rounded-sm">
              {numericPrice.toFixed(0)} RWF
            </div>
          )}*/}
        </div>

        <div className="bg-black px-1 pt-3 md:pt-4 pb-4 md:pb-5">
          <h3 className="font-canal text-white text-[15px] xsm:text-[16px] md:text-[18px] font-semibold leading-tight tracking-tight line-clamp-2 group-hover:text-red-500 transition-colors duration-200">
            {videoTitle}
          </h3>

          <p className="font-canal mt-2 text-gray-400 text-[12px] xsm:text-[13px] md:text-[15px] leading-none line-clamp-1">
            {category || channelName || "Live Sports"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardLive;