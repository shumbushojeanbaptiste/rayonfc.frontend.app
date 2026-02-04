import { useEffect, useRef } from "react";

export const useInfiniteScroll = (loadMore: () => void) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { threshold: 1 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return ref;
};
