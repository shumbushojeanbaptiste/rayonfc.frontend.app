// src/pages/PublicHome.tsx 

import Plans from "../components/balance/plans/Plans";
import Categories from "../components/categories/Categories";
import Behind from "./Behindscenes";
import Highlights from "./Highlights";
import Interview from "./Interview";
import Latestvideos from "./Latestvideos";
import Livevideos from "./Livevideos";
import Operations from "./Operations";
import Menplayers from "./Players/Menplayers";
import ArtistsList from "./Players/Menplayers";
import Womenplayers from "./Players/Womeplayers";
import Pressconference from "./Pressconference";
import Shortvideos from "./Shortsvideos";
import Training from "./Training";
import Trendsvideos from "./Trendsvideos";

 const PublicHome: React.FC = () => {
  return (
   
      <main className="min-h-screen bg-[#0f172a] text-white">
            <div className="mx-auto w-full max-w-[1600px]">
              <section className="mb-3 sm:mb-4">
                <Categories />
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

export default PublicHome;