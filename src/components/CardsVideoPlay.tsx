import React from "react";
import { ThumbsUp, Share2, Bookmark } from "lucide-react";

interface Props {
  title?: string;
  total?: string;
  videoTitle: string;
  channelName: string;
  followers?: string;
  periode: string;
  rate?: string;
  children: any;
}

const CardVideoPlay: React.FC<Props> = ({
  title,
  total,
  videoTitle,
  channelName,
  followers,
  periode,
  rate,
  children,
}) => {
  const ACCENT = "#05333a"; // THEME ACCENT COLOR

  return (
    <div className="p-4 bg-white shadow rounded-xl">

      {/* VIDEO PLAYER */}
      <div className="w-full rounded-xl overflow-hidden">{children}</div>

      {/* VIDEO TITLE */}
      <h2 className="text-2xl font-semibold mt-4 leading-tight text-black">
        {videoTitle}
      </h2>

      {/* VIEWS + DATE */}
      <div className="flex flex-wrap justify-between items-center mt-2 text-gray-600">
        <p className="text-base">{total}</p>
        <p className="text-sm">{periode}</p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 mt-4 border-y py-3 text-gray-700">
        <button
          className="flex items-center gap-2 transition"
          style={{ color: "black" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
        >
          <ThumbsUp size={18} /> Like
        </button>

        <button
          className="flex items-center gap-2 transition"
          style={{ color: "black" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
        >
          <Share2 size={18} /> Share
        </button>

        <button
          className="flex items-center gap-2 transition"
          style={{ color: "black" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
        >
          <Bookmark size={18} /> Save
        </button>
      </div>

      {/* CHANNEL INFO + FOLLOW BUTTON */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-black">{channelName}</h3>

          {followers && (
            <p className="text-gray-500 text-sm">{followers} followers</p>
          )}
        </div>

        {/* FOLLOW BUTTON THEMED */}
        <button
          className="px-4 py-2 rounded-lg text-white font-semibold transition"
          style={{ background: ACCENT }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#021b1e")}
          onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
        >
          Follow
        </button>
      </div>
    </div>
  );
};

export default CardVideoPlay;
