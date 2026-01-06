import React, { useEffect, useState } from "react";
import api from "../../api";

export default function Scomments() {
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/studio/comments").then((res) => {
      setComments(res.data.data);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Comments</h1>

      <div className="space-y-2">
        {comments.length === 0 ? (
          <div className="text-sm text-gray-500">No comments yet</div>
        ) : (
          comments.map((cm) => (
            <div key={cm.comment_id} className="bg-white dark:bg-gray-800 p-3 rounded shadow">
              <div className="font-semibold">
                {cm.first_name} {cm.last_name}{" "}
                <span className="text-sm text-gray-500">
                  on {cm.video_title}
                </span>
              </div>
              <div className="text-sm mt-1">{cm.comment}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
