import React from "react";
import { Link } from "react-router-dom";

interface CardDataStatsProps {
  id: number;
  videoTitle: string;
  channelName: string;
  total: string;
  periode: string;
  thumbnail: string;
  profileImage?: string;
  onClick?: () => void;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  id,
  videoTitle,
  channelName,
  total,
  periode,
  thumbnail,
  profileImage,
  onClick,
}) => {
  return (
    <Link
      to={`/watch/${id}`}
      onClick={onClick}
      className="block rounded-xl border border-gray-200 bg-white shadow-sm 
                 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 
                 dark:bg-gray-800 dark:border-gray-700"
    >
      {/* Video Thumbnail */}
      <div className="w-full aspect-video overflow-hidden rounded-t-xl bg-gray-200">
        <img
          src={thumbnail}
          alt={videoTitle}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex gap-3">
        {/* Profile Image */}
        <div>
          <img
            src={profileImage || "/default-avatar.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover bg-gray-300"
          />
        </div>

        {/* Video Info */}
        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
            {videoTitle}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
            {channelName}
          </p>

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{total}</span> •{" "}
            <span>{new Date(periode).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CardDataStats;
