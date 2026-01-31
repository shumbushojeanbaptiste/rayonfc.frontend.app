import DefaultLayout from "./DefaultLayout";
import PublicLayout from "./PublicLayout";

const UniversalLayout = () => {
  const token = localStorage.getItem("token");
  return token ? <DefaultLayout /> : <PublicLayout />;
};

export default UniversalLayout; 
