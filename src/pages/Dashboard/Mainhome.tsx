import Categories from "../../components/categories/Categories";
import Freevideos from "../Freevideos";
import Latestvideos from "../Latestvideos";
import Purchvideos from "../Purchasedvideos";
import Trendsvideos from "../Trendsvideos";
import Allvideos from "../Videos";

const Mainhome: React.FC = () => {
 
  return (
    <div className="">
      <Categories />
      {/*<Allvideos />*/}
      <Purchvideos/>
      <Trendsvideos/>
      <Freevideos />
      <Latestvideos />
      

     
    
    </div>
  );
};

export default Mainhome;
