// src/pages/PublicHome.tsx 

import Categories from "../components/categories/Categories";
import Shortvideos from "./Shortsvideos";
import Trendsvideos from "./Trendsvideos";
import Trendsvideossample from "./Trendsvideossample";

 const PublicHome: React.FC = () => {
  return (
   
      <div className="">
        <Categories />
        <Shortvideos />
        <Trendsvideos />
       {/*<Trendsvideossample/>*/}
       
       
       
      </div>
 
  );
};

export default PublicHome;