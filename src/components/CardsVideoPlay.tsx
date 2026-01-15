import React, { useState } from "react";
import {
  ThumbsUp,
  Share2,
  Bookmark,
  ThumbsDown,
  X,
  Link,
 
} from "lucide-react";
import { toast } from "react-toastify";
import {  BsWhatsapp} from "react-icons/bs";
import { RiFacebookFill, RiTwitterXFill } from "react-icons/ri";


interface Props {
  title?: string;
  total?: string;
  videoTitle: string;
  channelName: string;
  followers?: string;
  periode: string;
  rate?: string;
  children: any;
  shareUrl?: string;
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
  shareUrl,
}) => {
  const ACCENT = "#05333a";

  const [openShare, setOpenShare] = useState(false);
  const [startAt, setStartAt] = useState(false);

  const getCurrentTime = () => {
    const video = document.querySelector("video");
    return video ? Math.floor(video.currentTime) : 0;
  };

  const formatTimestamp = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}h${m}m${s}s`;
    if (m > 0) return `${m}m${s}s`;
    return `${s}s`;
  };

  const buildShareUrl = () => {
    if (!shareUrl) return "";
    if (!startAt) return shareUrl;
    return `${shareUrl}?t=${formatTimestamp(getCurrentTime())}`;
  };

  // ✅ FIXED: ALWAYS open YouTube-style modal
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenShare(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(buildShareUrl());
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="p-4 bg-white dark:bg-black shadow rounded-xl">
      {/* VIDEO PLAYER */}
      <div className="w-full rounded-xl overflow-hidden">{children}</div>

      {/* VIDEO TITLE */}
      <h2 className="text-2xl font-semibold mt-4 leading-tight text-black dark:text-white">
        {videoTitle}
      </h2>

      {/* VIEWS + DATE */}
      <div className="flex flex-wrap justify-between items-center mt-2 text-gray-600 dark:text-white">
        <p className="text-base">{total}</p>
        <p className="text-sm">{periode}</p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 mt-4 border-y py-3 text-gray-700  dark:text-white ">
        <button className="flex items-center gap-2 hover:text-gray-500 dark:hover:text-slate-300">
          <ThumbsUp size={18} /> Like
        </button>

        <button className="flex items-center gap-2 hover:text-gray-500 dark:hover:text-slate-300">
          <ThumbsDown size={18} /> Dislike
        </button>

        {/* ✅ FIXED SHARE BUTTON */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2  hover:text-gray-500 dark:hover:text-slate-300"
        >
          <Share2 size={18} /> Share
        </button>

        {/*<button className="flex items-center gap-2">
          <Bookmark size={18} /> Save
        </button>*/}
      </div>

      {/* CHANNEL INFO */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{channelName}</h3>
          {followers && (
            <p className="text-gray-500 text-sm">{followers} followers</p>
          )}
        </div>

        <button className="px-4 py-2 rounded-lg font-semibold text-white bg-green-950 hover:bg-green-900 dark:text-black dark:bg-yellow-300 dark:hover:bg-yellow-400">
          Follow
        </button>
      </div>

      {/* SHARE MODAL */}
      {openShare && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setOpenShare(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-white dark:bg-black p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share</h3>
              <button onClick={() => setOpenShare(false)}>
                <X />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center text-sm mb-4">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(buildShareUrl())}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <BsWhatsapp size={18} />
                WhatsApp
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  buildShareUrl()
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <RiFacebookFill size={18} />
                Facebook
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  buildShareUrl()
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1"
              >
                < RiTwitterXFill size={18} />
                X
              </a>

              <button
                onClick={copyLink}
                className="flex flex-col items-center gap-1"
              >
                <Link size={18} />
                Copy
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm mb-4">
              <input
                type="checkbox"
                checked={startAt}
                onChange={() => setStartAt(!startAt)}
              />
              Start at {formatTimestamp(getCurrentTime())}
            </label>

            <div className="flex gap-2">
              <input
                readOnly
                value={buildShareUrl()}
                className="flex-1 p-2 border rounded-md text-sm bg-transparent"
              />
              <button
                onClick={copyLink}
                className="px-3 py-2 rounded-md text-white bg-green-950 hover:bg-green-900 dark:text-black dark:bg-yellow-300 dark:hover:bg-yellow-400"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardVideoPlay;
