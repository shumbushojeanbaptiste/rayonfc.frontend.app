import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import DefaultLayout from "./layout/DefaultLayout";
import Slayout from "./components/Oleestudio/Slayout";
import Flayout from "./components/Finance/Flayout";

/* Public pages */
import PublicHome from "./pages/PublicHome";
import SignIn from "./pages/Authentication/SignIn";
import SignUp from "./pages/Authentication/SignUp";
import Verify from "./pages/Authentication/Verify";
import Videosplay from "./pages/Dashboard/Videosplay";

/* Auth pages */
import Mainhome from "./pages/Dashboard/Mainhome";

/* Studio */
import Sdashboard from "./pages/Oleestupages/Dashboard";
import Scontent from "./pages/Oleestupages/Content";
import Sanalytics from "./pages/Oleestupages/Analytics";
import Scomments from "./pages/Oleestupages/Comments";
import Supload from "./pages/Oleestupages/Upload";
import Ssettings from "./pages/Oleestupages/Settings";
import PublicLayout from "./layout/PublicLayout";
import Trendsvideos from "./pages/Trendsvideos";
import Freevideos from "./pages/Freevideos";
import Purchvideos from "./pages/Purchasedvideos";
import Latestvideos from "./pages/Latestvideos";
import Loader from "./common/Loader";
import Deposit from "./pages/Finance/Deposit";
import Fdashboard from "./pages/Finance/Dashboard";
import Withdraw from "./pages/Finance/Withdraw";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Searchsample from "./pages/Searchsample";
import Videosplaysample from "./pages/Dashboard/Videosplaysample";
import Shortvideos from "./pages/Shortsvideos";

/* 🔐 Auth guard */
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token"); // ✅ use localStorage

  if (!token) return <Navigate to="/auth/signin" replace />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token"); // ✅ update
      localStorage.removeItem("user");  // ✅ update
      return <Navigate to="/auth/signin" replace />;
    }
  } catch {
    localStorage.removeItem("token"); // ✅ update
    localStorage.removeItem("user");  // ✅ update
    return <Navigate to="/auth/signin" replace />;
  }

  return children;
};

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [dark, setDark] = useState(false);
  const { pathname } = useLocation();
  const token = localStorage.getItem("token"); // ✅ use localStorage

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <Loader />;

  return (
    <Routes>

      {/* 🌍 HOME - unified URL "/" */}
      <Route
        path="/"
        element={
          token ? (
            <RequireAuth>
              <DefaultLayout />
            </RequireAuth>
          ) : (
            <PublicLayout />
          )
        }
      >
        <Route
          index
          element={token ? <Mainhome /> : <PublicHome />}
        />
      </Route>

      {/* 🌍 PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path="auth/signin" element={<SignIn />} />
        <Route path="auth/signup" element={<SignUp />} />
        <Route path="auth/verify" element={<Verify />} />
         {/* 🎥 Video watch page (HASHED ID) */}
        <Route path="watching/:hash" element={<Videosplaysample />} />
        <Route path="home/searching" element={<Searchsample />} />
      </Route>

      {/* 🔐 AUTHENTICATED APP */}
      <Route
        element={
          <RequireAuth>
            <DefaultLayout />
          </RequireAuth>
        }
      >
        <Route path="music" element={<Trendsvideos />} />
        <Route path="gaming" element={<Trendsvideos />} />
        <Route path="news" element={<Trendsvideos />} />
        <Route path="sports" element={<Trendsvideos />} />
        <Route path="help" element={<Trendsvideos />} />
        <Route path="shorts" element={< Shortvideos />} />
        <Route path="home/search" element={<Search />} />
        <Route path="watch/:hash" element={<Videosplay />} />
        <Route path="trendsvideos" element={<Trendsvideos />} />
        <Route path="freevideos" element={<Freevideos />} />
        <Route path="myvideos" element={<Purchvideos />} />
        <Route path="latest" element={<Latestvideos />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Trendsvideos />} />
      </Route>

      {/* 🔐 OLEEPLAY STUDIO */}
      <Route
        element={
          <RequireAuth>
            <Slayout />
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

      {/* 🔐 OLEEPLAY FINANCE */}
      <Route
        element={
          <RequireAuth>
            <Flayout />
          </RequireAuth>
        }
      >
        <Route path="finance" element={<Fdashboard />} />
        <Route path="finance/deposits" element={<Deposit />} />
        <Route path="finance/withdrawals" element={<Withdraw />} />
       
      </Route>


    </Routes>
  );
}
