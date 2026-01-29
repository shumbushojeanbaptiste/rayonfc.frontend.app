import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import api from "../api";
import BuyVideoModal from "../components/BuyVideoModal";
import { getAuthUser } from "../utils/auth";
import { Video } from "../types/videouser";
import { encodeId } from "../utils/hashid";
import Noresult from "../images/no-search.png";
import CardDataStatsTre from "../components/CardDataStatsTre";

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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const user = useMemo(() => getAuthUser(), []);
  const cacheRef = useRef<Map<string, Video[]>>(new Map());

  const fileUrl = (path?: string) =>
    !path || path === "null" || path === "undefined"
      ? "/default-avatar.png"
      : path;

  // -----------------------------
  // LOAD WALLET BALANCE (ONCE)
  // -----------------------------
  const refreshWallet = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/api/payments/balance/${user.user_id}`);
      setWalletBalance(Number(res.data?.data?.balance || 0));
    } catch {
      setWalletBalance(0);
    }
  };

  useEffect(() => {
    if (user) refreshWallet();
  }, [user]);

  // -----------------------------
  // HANDLE VIDEO CLICK (NO REFRESH)
  // -----------------------------
  const handleVideoClick = (video: Video) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (!video.price || Number(video.price) === 0) {
      navigate(`/watch/${encodeId(video.id)}`, {
        state: { ...video, source: "search" },
      });
      return;
    }

    // 🔥 Removed refreshWallet()
    setSelectedVideo(video);
  };

  /* -----------------------------
     RESET ON QUERY CHANGE
  ------------------------------*/
  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setSearchAttempted(false);
  }, [query]);

  /* -----------------------------
     SEARCH REQUEST
  ------------------------------*/
  useEffect(() => {
    if (!query || !hasMore) return;

    const cacheKey = `${query}-${page}`;
    const controller = new AbortController();
    let active = true;

    if (cacheRef.current.has(cacheKey)) {
      setResults((prev) => [...prev, ...cacheRef.current.get(cacheKey)!]);
      setSearchAttempted(true);
      return () => {
        active = false;
      };
    }

    setLoading(true);

    api
      .post(
        "/api/videos/search",
        { keyword: query, page, limit: PAGE_SIZE },
        { signal: controller.signal }
      )
      .then((res) => {
        if (!active) return;

        const newData: Video[] = res.data.data || [];
        cacheRef.current.set(cacheKey, newData);

        setResults((prev) => {
          const seen = new Set(prev.map((v) => v.id));
          return [...prev, ...newData.filter((v) => !seen.has(v.id))];
        });

        if (newData.length < PAGE_SIZE) setHasMore(false);
        setSearchAttempted(true);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          console.error(err);
          setError("Failed to fetch results");
          setSearchAttempted(true);
        }
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
      controller.abort();
    };
  }, [query, page, hasMore]);

  /* -----------------------------
     INFINITE SCROLL
  ------------------------------*/
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((video) => (
          <CardDataStatsTre
            key={`video-${video.id}`}
            id={video.id}
            videoTitle={video.title}
            channelName={video.owner || "Unknown Owner"}
            total={`${video.views ?? 0} views`}
            price={video.price}
            duration={video.duration}
            thumbnail={fileUrl(video.thumbnail)}
            profileImage={fileUrl(video.profile_photo)}
            onClick={() => handleVideoClick(video)}
          />
        ))}

        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-44 bg-gray-300 rounded mb-3" />
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}

        {!loading && searchAttempted && results.length === 0 && query && (
          <div className="flex flex-col items-center justify-center col-span-full mt-12 text-center">
            <img src={Noresult} className="w-20 mb-4" />
            <p className="text-gray-500 text-lg">
              No videos found for <b>{query}</b>
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

      {selectedVideo && (
        <BuyVideoModal
          video={selectedVideo}
          walletBalance={walletBalance}
          onClose={() => setSelectedVideo(null)}
          onSuccess={() => {
            refreshWallet();
            setSelectedVideo(null);
          }}
        />
      )}
    </div>
  );
};

export default Search;
