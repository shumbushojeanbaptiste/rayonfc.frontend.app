import { useEffect } from "react";
import api from "../api";

export const useShortAnalytics = (shortId: number) => {
  useEffect(() => {
    if (!shortId) return;
    api.post("/api/analytics/short/view", { shortId });
    const start = Date.now();
    return () => {
      api.post("/api/analytics/short/watch-time", {
        shortId,
        watchTime: Math.floor((Date.now() - start) / 1000),
      });
    };
  }, [shortId]);
};
