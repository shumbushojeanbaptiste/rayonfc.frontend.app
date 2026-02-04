import React, { useRef, useState } from "react";

interface Props {
  id: number;
  title: string;
  owner: string;
  views: number;
  duration: string;
  price?: number | string;
  thumbnail?: string;
  videoUrl?: string;
  onClick?: () => void;
}

const CardsDataStatshorts: React.FC<Props> = ({
  title,
  owner,
  views,
  duration,
  price,
  thumbnail,
  videoUrl,
  onClick,
}) => {
  const numericPrice = Number(price || 0);
  const isPaid = numericPrice > 0;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => {
        setHovered(true);
        videoRef.current?.play();
      }}
      onMouseLeave={() => {
        setHovered(false);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
      className="cursor-pointer transition-transform duration-300 hover:scale-[1.03] w-[170px]"
    >
      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black">
        {!hovered && (
          <img
            src={thumbnail || "/default-thumbnail.jpg"}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}

        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

       {/* {isPaid && (
          <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs z-10">
            {numericPrice.toFixed(2)} Rwf
          </div>
        )} */}

        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs z-10">
          {duration}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 text-white z-10">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-gray-300 mt-1">{views.toLocaleString()} views</p>
        </div>
      </div>
    </div>
  );
};

export default CardsDataStatshorts;
