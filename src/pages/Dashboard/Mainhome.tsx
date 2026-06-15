import Categories from "../../components/categories/Categories";
import Latestvideos from "../Latestvideos";
import Trendsvideos from "../Trendsvideos";
import Highlights from "../Highlights";
import Training from "../Training";
import Operations from "../Operations";
import Interview from "../Interview";
import Pressconference from "../Pressconference";
import Behind from "../Behindscenes";

const Mainhome: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <div className="mx-auto w-full max-w-[1600px]">
        <section className="mb-3 sm:mb-4">
          <Categories />
        </section>

        <section className="mb-3 sm:mb-4">
          <Latestvideos />
        </section>

        <section className="mb-3 sm:mb-4">
          <Trendsvideos />
        </section>

        <section className="mb-3 sm:mb-4">
          <Highlights />
        </section>

        <section className="mb-3 sm:mb-4">
          <Interview />
        </section>

        <section className="mb-3 sm:mb-4">
          <Operations />
        </section>

        <section className="mb-3 sm:mb-4">
          <Behind />
        </section>

        <section className="mb-3 sm:mb-4">
          <Pressconference />
        </section>

        <section className="mb-3 sm:mb-4">
          <Training />
        </section>
      </div>
    </main>
  );
};

export default Mainhome;