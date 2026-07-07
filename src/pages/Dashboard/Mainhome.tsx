import Categories from "../../components/categories/Categories";
import Latestvideos from "../Latestvideos";
import Trendsvideos from "../Trendsvideos";
import Highlights from "../Highlights";
import Training from "../Training";
import Operations from "../Operations";
import Interview from "../Interview";
import Pressconference from "../Pressconference";
import Behind from "../Behindscenes";
import Latestvideoshome from "../Latestvideoshome";
import Trendsvideoshome from "../Trendsvideoshome";
import Highlightshome from "../Highlightshome";
import Traininghome from "../Traininghome";
import Interviewhome from "../Interviewhome";
import Behindhome from "../Behindsceneshome";
import Operationshome from "../Operationshome";
import Pressconferencehome from "../Pressconferencehome";

const Mainhome: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <div className="mx-auto w-full max-w-[1600px]">
        <section className="mb-3 sm:mb-4">
          <Categories />
        </section>

        <section className="mb-3 sm:mb-4">
          <Latestvideoshome />
        </section>

        <section className="mb-3 sm:mb-4">
          <Trendsvideoshome />
        </section>

        <section className="mb-3 sm:mb-4">
          <Highlightshome />
        </section>

        <section className="mb-3 sm:mb-4">
          <Interviewhome />
        </section>

        <section className="mb-3 sm:mb-4">
          <Operationshome />
        </section>

        <section className="mb-3 sm:mb-4">
          <Behindhome />
        </section>

        <section className="mb-3 sm:mb-4">
          <Pressconferencehome />
        </section>

        <section className="mb-3 sm:mb-4">
          <Traininghome />
        </section>
      </div>
    </main>
  );
};

export default Mainhome; 