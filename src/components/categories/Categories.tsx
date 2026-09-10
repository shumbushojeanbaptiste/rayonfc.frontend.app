"use client";

import { useRef, useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import api from "../../api";

export type Category = {
  category_id: number;
  category_name: string;
};

type CategoriesProps = {
  activeCategory: string;
  onCategoryChange: (category: Category) => void;
};

/* =========================================================
   CATEGORY CACHE
   Prevents unnecessary repeated API requests.
   ========================================================= */

let categoriesCache: Category[] | null = null;
let categoriesPromise: Promise<Category[]> | null = null;

/**
 * Loads categories from the API only when they are not
 * already cached.
 *
 * If multiple components request categories at the same
 * time, they will share the same API request.
 */
const getCategories = async (): Promise<Category[]> => {
  // Return cached data immediately
  if (categoriesCache) {
    return categoriesCache;
  }

  // If a request is already running, reuse it
  if (categoriesPromise) {
    return categoriesPromise;
  }

  categoriesPromise = api
    .get("/api/categories/all")
    .then((res) => {
      if (!res.data?.success) {
        return [];
      }

      const apiCategories: Category[] = res.data?.data || [];

      const result: Category[] = [
        {
          category_id: 0,
          category_name: "All",
        },
        ...apiCategories,
      ];

      // Save result in memory
      categoriesCache = result;

      return result;
    })
    .finally(() => {
      // Clear the promise after completion.
      // The actual data remains in categoriesCache.
      categoriesPromise = null;
    });

  return categoriesPromise;
};

export default function Categories({
  activeCategory,
  onCategoryChange,
}: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     LOAD CATEGORIES
     ========================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        const data = await getCategories();

        if (mounted) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     UPDATE SCROLL ARROWS
     ========================================================= */

  const updateArrows = () => {
    const el = scrollRef.current;

    if (!el) return;

    const atLeft = el.scrollLeft <= 0;

    const atRight =
      el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

    setShowLeft(!atLeft);
    setShowRight(!atRight);
  };

  /* =========================================================
     SCROLL LEFT
     ========================================================= */

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({
      left: -250,
      behavior: "smooth",
    });
  };

  /* =========================================================
     SCROLL RIGHT
     ========================================================= */

  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: 250,
      behavior: "smooth",
    });
  };

  /* =========================================================
     SCROLL EVENT
     ========================================================= */

  useEffect(() => {
    updateArrows();

    const el = scrollRef.current;

    if (!el) return;

    const listener = () => updateArrows();

    el.addEventListener("scroll", listener);

    return () => {
      el.removeEventListener("scroll", listener);
    };
  }, [categories]);

  /* =========================================================
     CATEGORY CLICK
     ========================================================= */

  const handleCategoryClick = (category: Category) => {
    onCategoryChange(category);
  };

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="relative w-full border-gray-200 select-none">
      {/* LEFT ARROW */}
      {showLeft && (
        <button
          type="button"
          onClick={scrollLeft}
          aria-label="Scroll categories left"
          className="flex absolute -left-4 top-1/2 -translate-y-1/2 z-10
                     bg-slate-100 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-800
                     w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
                     items-center justify-center rounded-full
                     hover:bg-white hover:shadow-xl transition
                     dark:text-white dark:bg-gray-800"
        >
          <ChevronLeftIcon
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6
                       text-gray-700 dark:text-white"
          />
        </button>
      )}

      {/* CATEGORIES */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth
                   px-4 py-2 sm:px-10 sm:py-3 md:px-14 md:py-4"
      >
        {categories.map((category) => (
          <button
            type="button"
            key={category.category_id}
            onClick={() => handleCategoryClick(category)}
            className={`
              whitespace-nowrap rounded-full px-3 py-1.5 text-xs
              sm:px-4 sm:py-2 sm:text-sm
              md:px-5 md:py-2.5 md:text-sm
              font-medium transition
              ${
                activeCategory === category.category_name
                  ? "bg-blue-900 text-white"
                  : "bg-gray-200 text-gray-950 hover:bg-gray-300 dark:text-white dark:bg-gray-800"
              }
            `}
          >
            {category.category_name}
          </button>
        ))}
      </div>

      {/* RIGHT ARROW */}
      {showRight && (
        <button
          type="button"
          onClick={scrollRight}
          aria-label="Scroll categories right"
          className="flex absolute -right-4 top-1/2 -translate-y-1/2 z-10
                     bg-slate-100 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-800
                     w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
                     items-center justify-center rounded-full
                     hover:bg-white hover:shadow-xl transition
                     dark:text-white dark:bg-gray-800"
        >
          <ChevronRightIcon
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6
                       text-gray-700 dark:text-white"
          />
        </button>
      )}
    </div>
  );
}