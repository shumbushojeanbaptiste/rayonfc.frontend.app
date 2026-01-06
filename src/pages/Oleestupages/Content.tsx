import React, { useEffect, useState } from "react";
import api from "../../api";

function VideoRow({ v }: { v: any }) {
  const thumbnailUrl =
    v.thumbnail?.startsWith("http")
      ? v.thumbnail
      : `${api.defaults.baseURL}${v.thumbnail}`;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="p-2">
        <img
          src={thumbnailUrl}
          className="w-48 h-28 object-cover rounded"
          alt={v.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/placeholder-thumbnail.png";
          }}
        />
      </td>

      <td className="p-2">
        <div className="font-semibold">{v.title}</div>
        <div className="text-sm text-gray-500">
          {(v.views_count ?? 0).toLocaleString()} views •{" "}
          {new Date(v.created_at).toLocaleDateString()}
        </div>
      </td>

      <td className="p-2">
        {v.is_verified ? "Verified" : "Pending"}
      </td>

      <td className="p-2">
        <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">
          {v.status}
        </span>
      </td>
    </tr>
  );
}

export default function Scontent() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/studio/videos")
      .then((res) => setVideos(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Content</h1>

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left p-2">Thumbnail</th>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Verification</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {videos.map((v) => (
              <VideoRow key={v.video_id} v={v} />
            ))}
          </tbody>
        </table>

        {!loading && videos.length === 0 && (
          <div className="p-4 text-sm text-gray-500">
            You have not uploaded any videos yet.
          </div>
        )}
      </div>
    </div>
  );
}
