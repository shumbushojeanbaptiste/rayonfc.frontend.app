import React from "react";

interface Props {
  id: number;
  title: string;
  owner: string;
  views: number;
  duration: string;
  price?: number | string;
  thumbnail?: string;
  onClick?: () => void;
}

const CardsDataStatshorts: React.FC<Props> = ({
  title,
  owner,
  views,
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
      className="rounded-xl cursor-pointer p-2 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:scale-[1.02]"
    >
      <div className="relative">
        <img
          src={thumbnail || "/default-avatar.png"}
          alt={title}
          className="w-full h-44 object-cover rounded-xl"
        />

        {isPaid && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {numericPrice.toFixed(2)}
          </div>
        )}

        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {duration}
        </div>
      </div>

      <div className="mt-2">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
          {owner}
        </p>
      </div>

      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {views.toLocaleString()} views
      </div>
    </div>
  );
};

export default CardsDataStatshorts;
