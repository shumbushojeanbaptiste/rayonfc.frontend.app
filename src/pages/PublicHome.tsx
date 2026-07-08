import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Categories, { Category } from "../components/categories/Categories";
import PublicVideos from "./PublicVideos";
import CategoryVideos from "./CategoryVideos";

const PublicHome: React.FC = () => {
  const location = useLocation();

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCategoryId, setActiveCategoryId] = useState(0);

  useEffect(() => {
    const category = location.state as
      | {
          category_id?: number;
          category_name?: string;
        }
      | undefined;

    if (category?.category_id && category?.category_name) {
      setActiveCategory(category.category_name);
      setActiveCategoryId(category.category_id);
      return;
    }

    setActiveCategory("All");
    setActiveCategoryId(0);
  }, [location.state]);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category.category_name);
    setActiveCategoryId(category.category_id);
  };

  const renderContent = () => {
    if (activeCategoryId === 0) {
      return <PublicVideos />;
    }

    return (
      <CategoryVideos
        categoryId={activeCategoryId}
        title={activeCategory}
      />
    );
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <div className="mx-auto w-full max-w-[1600px]">
        <section className="mb-3 sm:mb-4">
          <Categories
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </section>

        <section className="mb-3 sm:mb-4">
          {renderContent()}
        </section>
      </div>
    </main>
  );
};

export default PublicHome;