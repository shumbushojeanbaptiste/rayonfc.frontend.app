import Categories from "../../components/categories/Categories";
import ArtistsList from "../Players/Menplayers";
import Freevideos from "../Freevideos";
import Latestvideos from "../Latestvideos";
import Purchvideos from "../Purchasedvideos";
import Shortvideos from "../Shortsvideos";
import Trendsvideos from "../Trendsvideos";
import Menplayers from "../Players/Menplayers";
import Womenplayers from "../Players/Womeplayers";
import Livevideos from "../Livevideos";
//import Allvideos from "../Videos";

const Mainhome: React.FC = () => {
 
  return (
    <div className="">
      <Categories />
      {/*<Livevideos />*/}
      {/*<Allvideos />*/}
      {/*<Purchvideos/>*/}
      <Trendsvideos/>
      {/*<Menplayers />
      <Womenplayers />*/}
      {/*<Shortvideos />*/}
      {/*<Freevideos />*/}
      {/*<Latestvideos />*/}
    
    </div>
  );
};

export default Mainhome;
