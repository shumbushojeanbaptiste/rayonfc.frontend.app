import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import DefaultLayout from "./layout/DefaultLayout";
import Slayout from "./components/Oleestudio/Slayout";

/* Public pages */
import PublicHome from "./pages/PublicHome";
import SignIn from "./pages/Authentication/SignIn";
import SignUp from "./pages/Authentication/SignUp";
import Verify from "./pages/Authentication/Verify";
import Videosplay from "./pages/Dashboard/Videosplay";

/* Auth pages */
import Mainhome from "./pages/Dashboard/Mainhome";
/*import Profile from "./pages/Profile";
import FormElements from "./pages/Form/FormElements";
import FormLayout from "./pages/Form/FormLayout";
import Tables from "./pages/Tables";
import Settings from "./pages/Settings";
import Chart from "./pages/Chart";
import Alerts from "./pages/UiElements/Alerts";
import Buttons from "./pages/UiElements/Buttons";*/

/* Studio */
import Sdashboard from "./pages/Oleestupages/Dashboard";
import Scontent from "./pages/Oleestupages/Content";
import Sanalytics from "./pages/Oleestupages/Analytics";
import Scomments from "./pages/Oleestupages/Comments";
import Supload from "./pages/Oleestupages/Upload";
import Ssettings from "./pages/Oleestupages/Settings";
import PublicLayout from "./layout/PublicLayout";
import Trendsvideos from "./pages/Trendsvideos";
//import Allvideos from "./pages/Videos";
import Freevideos from "./pages/Freevideos";
import Purchvideos from "./pages/Purchasedvideos";
import Latestvideos from "./pages/Latestvideos";
import Loader from "./common/Loader";
import Search from "./pages/Search";
 
/* 🔐 Auth guard */
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = sessionStorage.getItem("token");

  if (!token) return <Navigate to="/auth/signin" replace />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      return <Navigate to="/auth/signin" replace />;
    }
  } catch {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    return <Navigate to="/auth/signin" replace />;
  }

  return children;
};

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [dark, setDark] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <Routes>

      {/* 🌍 PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>
        <Route
          index
          element={
            sessionStorage.getItem("token")
              ? <Navigate to="/" replace />
              : <PublicHome />
          }
        />

        <Route path="auth/signin" element={<SignIn />} />
        <Route path="auth/signup" element={<SignUp />} />
        <Route path="auth/verify" element={<Verify />} />
        <Route path="watch/:id" element={<Videosplay />} />
      </Route>

      {/* 🔐 AUTHENTICATED APP */}
      <Route
        element={
          <RequireAuth>
            <DefaultLayout />
          </RequireAuth>
        }
      >
        <Route path="home/search" element={<Search />} />
        <Route path="home" element={<Mainhome />} />
        <Route path="home/trendsvideos" element={<Trendsvideos />} />
        <Route path="home/freevideos" element={<Freevideos />} />
        <Route path="home/myvideos" element={<Purchvideos />} />
        <Route path="home/latest" element={<Latestvideos />} />
      </Route>

      {/* 🔐 OLEEPLAY STUDIO */}
      <Route
        element={
          <RequireAuth>
            <Slayout dark={dark} setDark={setDark} />
          </RequireAuth>
        }
      >
        <Route path="studio" element={<Sdashboard />} />
        <Route path="studio/content" element={<Scontent />} />
        <Route path="studio/analytics" element={<Sanalytics />} />
        <Route path="studio/comments" element={<Scomments />} />
        <Route path="studio/upload" element={<Supload />} />
        <Route path="studio/settings" element={<Ssettings />} />
      </Route>

    </Routes>
  );
}
