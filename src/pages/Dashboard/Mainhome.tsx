import Categories from "../../components/categories/Categories";
import ArtistsList from "../Artists/ArtistsList";
import Freevideos from "../Freevideos";
import Latestvideos from "../Latestvideos";
import Purchvideos from "../Purchasedvideos";
import Shortvideos from "../Shortsvideos";
import Trendsvideos from "../Trendsvideos";
//import Allvideos from "../Videos";

const Mainhome: React.FC = () => {
 
  return (
    <div className="">
      <Categories />
      
      {/*<Allvideos />*/}
      {/*<Purchvideos/>*/}
      <Trendsvideos/>
      <ArtistsList />
      <Shortvideos />
      {/*<Freevideos />*/}
      {/*<Latestvideos />*/}
    
    </div>
  );
};

export default Mainhome;
