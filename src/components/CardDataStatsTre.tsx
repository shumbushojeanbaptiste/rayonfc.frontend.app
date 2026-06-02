import React from "react";

interface Props {
  id: number;
  videoTitle: string;
  channelName: string;
  duration: string;
  price?: number | string | null;
  thumbnail?: string;
  onClick: () => void;
}

const CardDataStatsTre: React.FC<Props> = ({
  videoTitle,
  channelName,
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

        {/*<div className="absolute top-4 left-0 right-0 px-4 text-center">
          <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.16em] text-white/95">
            Une série CANAL+ originale
          </p>
        </div>

        <div className="absolute top-3 right-3 rounded-sm bg-red-600 px-3 py-1 text-[11px] sm:text-xs md:text-sm font-bold text-white shadow-lg">
          S'abonner
        </div>*/}

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
      </div>
    </div>
  );
};

export default CardDataStatsTre;