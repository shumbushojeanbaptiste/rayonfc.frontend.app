// src/pages/PublicHome.tsx 

import Categories from "../components/categories/Categories";
import ArtistsList from "./Artists/ArtistsList";
import Shortvideos from "./Shortsvideos";
import Trendsvideos from "./Trendsvideos";

 const PublicHome: React.FC = () => {
  return (
   
      <div className="">
        <Categories />
        <Trendsvideos />
        <ArtistsList />
        <Shortvideos />
   
       
       
      </div>
 
  );
};

export default PublicHome;