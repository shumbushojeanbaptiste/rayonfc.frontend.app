// src/pages/PublicHome.tsx 

import Categories from "../components/categories/Categories";
import Menplayers from "./Players/Menplayers";
import ArtistsList from "./Players/Menplayers";
import Womenplayers from "./Players/Womeplayers";
import Shortvideos from "./Shortsvideos";
import Trendsvideos from "./Trendsvideos";

 const PublicHome: React.FC = () => {
  return (
   
      <div className="">
        <Categories />
        <Trendsvideos />
        {/*<Menplayers />
        <Womenplayers />*/}
        <Shortvideos />
   
       
       
      </div>
 
  );
};

export default PublicHome;