// src/pages/PublicHome.tsx 

import Categories from "../components/categories/Categories";
import Shortvideos from "./Shortsvideos";
import Trendsvideossample from "./Trendsvideossample";

 const PublicHome: React.FC = () => {
  return (
   
      <div className="">
        <Categories />
        <Shortvideos />
       <Trendsvideossample/>
       
       
       
      </div>
 
  );
};

export default PublicHome;