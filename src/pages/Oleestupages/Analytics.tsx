import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../api";

export default function Sanalytics() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/studio/analytics").then((res) => {
      setData(res.data.data);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Views over time</h3>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="views" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
