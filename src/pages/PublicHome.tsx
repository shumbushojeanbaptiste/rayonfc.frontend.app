// src/pages/PublicHome.tsx 

import Plans from "../components/balance/plans/Plans";
import Categories from "../components/categories/Categories";
import Behind from "./Behindscenes";
import Behindhome from "./Behindsceneshome";
import Highlights from "./Highlights";
import Highlightshome from "./Highlightshome";
import Interview from "./Interview";
import Interviewhome from "./Interviewhome";
import Latestvideos from "./Latestvideos";
import Livevideos from "./Livevideos";
import Operations from "./Operations";
import Operationshome from "./Operationshome";
import Menplayers from "./Players/Menplayers";
import ArtistsList from "./Players/Menplayers";
import Womenplayers from "./Players/Womeplayers";
import Pressconference from "./Pressconference";
import Pressconferencehome from "./Pressconferencehome";
import Shortvideos from "./Shortsvideos";
import Training from "./Training";
import Traininghome from "./Traininghome";
import Trendsvideos from "./Trendsvideos";
import Trendsvideoshome from "./Trendsvideoshome";

 const PublicHome: React.FC = () => {
  return (
   
      <main className="min-h-screen bg-[#0f172a] text-white">
            <div className="mx-auto w-full max-w-[1600px]">
              <section className="mb-3 sm:mb-4">
                <Categories />
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

export default PublicHome;