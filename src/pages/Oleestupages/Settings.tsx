import React, { useEffect, useState } from "react";
import api from "../../api";

export default function Ssettings() {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    api.get("/api/studio/settings").then((res) => {
      setUser(res.data.data);
    });
  }, []);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-xl">
        <div className="mb-4">
          <label className="text-sm text-gray-500">Name</label>
          <div className="font-semibold">
            {user.first_name} {user.last_name}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-500">Email</label>
          <div className="font-semibold">{user.email}</div>
        </div>

        {user.profile_image && (
          <img
            src={user.profile_image}
            className="w-24 h-24 rounded-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
