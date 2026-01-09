"use client";
import { useRef, useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const categories = [
  "All",
  "Music",
  "Choirs",
  "Contemporary Worship Music",
  "African Music",
  "Mixes",
  "News",
  "JavaScript",
  "Live",
  "Contemporary R&B",
  "Zouk music",
];

export default function Categories() {
  const [active, setActive] = useState("All");

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;

    const atLeft = el.scrollLeft <= 0;
    const atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

    setShowLeft(!atLeft);
    setShowRight(!atRight);
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -250, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 250, behavior: "smooth" });
  };

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;

    const listener = () => updateArrows();
    el.addEventListener("scroll", listener);

    return () => el.removeEventListener("scroll", listener);
  }, []);

  return (
    <div className="relative w-full border-b border-gray-200 select-none">

      {/* LEFT ARROW */}
      {showLeft && (
        <button
          onClick={scrollLeft}
          className="flex absolute left-0 top-1/2 -translate-y-1/2 z-10
                     bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200
                     w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
                     items-center justify-center rounded-full
                     hover:bg-white hover:shadow-xl transition"
        >
          <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" />
        </button>
      )}

      {/* SCROLLABLE CATEGORIES */}
      <div
        ref={scrollRef}
        className="
          flex gap-3 
          overflow-x-auto scrollbar-hide scroll-smooth
          px-4 py-2
          sm:px-10 sm:py-3
          md:px-14 md:py-4
        "
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActive(category)}
            className={`
              whitespace-nowrap 
              rounded-full 
              px-3 py-1.5 text-xs
              sm:px-4 sm:py-2 sm:text-sm
              md:px-5 md:py-2.5 md:text-sm
              font-medium transition
              ${
                active === category
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* RIGHT ARROW */}
      {showRight && (
        <button
          onClick={scrollRight}
          className="flex absolute right-0 top-1/2 -translate-y-1/2 z-10
                     bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200
                     w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
                     items-center justify-center rounded-full
                     hover:bg-white hover:shadow-xl transition"
        >
          <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" />
        </button>
      )}
    </div>
  );
}
