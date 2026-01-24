import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import api from "../api";
import CardDataStatsTre from "../components/CardDataStatsTre";
import CardDataStatsPur from "../components/CardDataStatsPur";
import BuyVideoModal from "../components/BuyVideoModal";
import { getAuthUser } from "../utils/auth";
import { Video } from "../types/videouser";
import { encodeId } from "../utils/hashid";
import Noresult from '../images/no-search.png';

const PAGE_SIZE = 10;

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const observerRef = useRef<HTMLDivElement | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("q") || "").trim();
  }, [location.search]);

  const [results, setResults] = useState<Video[]>([]);
  const [purchasedVideos, setPurchasedVideos] = useState<number[]>([]); // IDs of purchased videos
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [searchAttempted, setSearchAttempted] = useState(false); // ✅ NEW

  const user = getAuthUser();
  const ACCENT = "#05333a";

  // Cache
  const cacheRef = useRef<Map<string, Video[]>>(new Map());

  // Highlight helper
  const highlightText = (text: string, keyword: string) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, "ig");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <mark key={i} className="bg-yellow-300">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Reset on query change
  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setSearchAttempted(false); // ✅ reset on new query
  }, [query]);

  // Load wallet balance
  useEffect(() => {
    if (!user) {
      setWalletBalance(0);
      setLoadingBalance(false);
      return;
    }

    api
      .get(`/api/payments/balance/${user.user_id}`)
      .then((res) => setWalletBalance(Number(res.data.data?.balance || 0)))
      .catch(() => setWalletBalance(0))
      .finally(() => setLoadingBalance(false));

    // Load purchased videos
    api
      .get(`/api/accessible/purchased-videos`)
      .then((res) => {
        const ids = (res.data.data || []).map((v: Video) => v.id);
        setPurchasedVideos(ids);
      })
      .catch(() => setPurchasedVideos([]));
  }, [user]);

  // Fetch search results
  useEffect(() => {
    if (!query || !hasMore) return;

    const cacheKey = `${query}-${page}`;
    const controller = new AbortController();

    if (cacheRef.current.has(cacheKey)) {
      setResults((prev) => [...prev, ...cacheRef.current.get(cacheKey)!]);
      setSearchAttempted(true); // ✅ mark that search ran
      return;
    }

    setLoading(true);

    api
      .post<{ success: boolean; data: Video[] }>(
        "/api/videos/search",
        { keyword: query, page, limit: PAGE_SIZE },
        { signal: controller.signal }
      )
      .then((res) => {
        const newData = res.data.data || [];
        cacheRef.current.set(cacheKey, newData);
        setResults((prev) => [...prev, ...newData]);
        if (newData.length < PAGE_SIZE) setHasMore(false);
        setSearchAttempted(true); // ✅ mark search attempted
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        console.error(err);
        setError("Failed to fetch results");
        setSearchAttempted(true); // ✅ mark search attempted even on error
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query, page, hasMore]);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  const fileUrl = (path?: string) => {
    if (!path || path === "null" || path === "undefined") return "/default-avatar.png";
    return path.includes("/") ? path : `${path}`;
  };

  const handleBuy = (video: Video) => {
    if (!user) {
      alert("Please login first");
      return;
    }
    setSelectedVideo(video);
  };

  const handleAddMoney = () => {
    navigate({ pathname: "/finance/deposits", search: "?deposit=true" });
  };

  const handleWatch = (video: Video) => {
    navigate(`/watch/${encodeId(video.id)}`, { state: { ...video, source: "search" } });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((video) => {
          const numericPrice = Number(video.price || 0);
          const isPaid = numericPrice > 0;
          const canBuy = !loadingBalance && walletBalance >= numericPrice;
          const isPurchased = purchasedVideos.includes(video.id);

          // Already purchased videos
          if (isPurchased) {
            return (
              <CardDataStatsPur
                key={video.id}
                id={video.id}
                videoTitle={highlightText(video.title, query) as any}
                channelName={video.owner || "Unknown Owner"}
                total={`${video.views ?? 0} views`}
                thumbnail={fileUrl(video.thumbnail)}
                profileImage={fileUrl(video.profile_photo)}
                onClick={() => handleWatch(video)}
              />
            );
          }

          // Videos not purchased
          return (
            <CardDataStatsTre
              key={video.id}
              id={video.id}
              videoTitle={highlightText(video.title, query) as any}
              channelName={video.owner || "Unknown Owner"}
              total={`${video.views ?? 0} views`}
              price={numericPrice}
              thumbnail={fileUrl(video.thumbnail)}
              profileImage={fileUrl(video.profile_photo)}
              canBuy={canBuy}
              onClick={() => !isPaid && handleWatch(video)}
              onBuy={() => handleBuy(video)}
              onAddMoney={handleAddMoney}
            />
          );
        })}

        {/* Skeleton loaders */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="border rounded-lg p-4 animate-pulse"
            >
              <div className="h-44 bg-gray-300 rounded mb-3" />
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}

        {/* No results message */}
        {!loading && searchAttempted && results.length === 0 && query && (
          <div className="flex flex-col items-center justify-center col-span-full mt-12 px-4 sm:px-0 text-center">
            <img
              src={Noresult}
              alt="No Results"
              className="w-16 h-16 dark:filter dark:invert sm:w-20 sm:h-20 mb-4 animate-bounce-slow"
            />
            <p className="text-gray-500 text-base sm:text-lg md:text-xl max-w-md">
              No videos match your search for{" "}
              <span className="font-semibold text-gray-700 dark:text-white">{query}</span>.
            </p>
            <p className="text-gray-400 text-sm sm:text-base mt-2 max-w-xs sm:max-w-sm">
              Try different keywords.
            </p>
          </div>
        )}
      </div>

      <div ref={observerRef} className="h-10" />

      {!loading && !hasMore && results.length > 0 && (
        <p className="text-center text-gray-500 mt-6">
          You’ve reached the end
        </p>
      )}

      {/* BUY VIDEO MODAL */}
      {selectedVideo && (
        <BuyVideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onSuccess={() => {
            setSelectedVideo(null);
            if (user) {
              api
                .get(`/api/payments/balance/${user.user_id}`)
                .then((res) => setWalletBalance(Number(res.data.data?.balance || 0)))
                .catch(() => {});
            }
          }}
        />
      )}
    </div>
  );
};

export default Search;
