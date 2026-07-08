"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import api from "../../api";

export type Category = {
  category_id: number;
  category_name: string;
};

type CategoriesProps = {
  activeCategory: string;
  onCategoryChange: (category: Category) => void;
};

export default function Categories({
  activeCategory,
  onCategoryChange,
}: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/categories/all");

        if (res.data?.success) {
          const apiCategories: Category[] = res.data.data;
          setCategories([{ category_id: 0, category_name: "All" }, ...apiCategories]);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    fetchCategories();
  }, []);

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
  }, [categories]);

  const handleCategoryClick = (category: Category) => {
    onCategoryChange(category);
  };

  return (
    <div className="relative w-full border-gray-200 select-none">
      {showLeft && (
        <button
          onClick={scrollLeft}
          className="flex absolute -left-4 top-1/2 -translate-y-1/2 z-10
                     bg-slate-100 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-800
                     w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
                     items-center justify-center rounded-full
                     hover:bg-white hover:shadow-xl transition dark:text-white dark:bg-gray-800"
        >
          <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700 dark:text-white" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth
                   px-4 py-2 sm:px-10 sm:py-3 md:px-14 md:py-4"
      >
        {categories.map((category) => (
          <button
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

      {showRight && (
        <button
          onClick={scrollRight}
          className="flex absolute -right-4 top-1/2 -translate-y-1/2 z-10
                     bg-slate-100 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-800
                     w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
                     items-center justify-center rounded-full
                     hover:bg-white hover:shadow-xl transition dark:text-white dark:bg-gray-800"
        >
          <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700 dark:text-white" />
        </button>
      )}
    </div>
  );
}