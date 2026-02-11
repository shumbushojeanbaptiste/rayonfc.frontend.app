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
import Shortvideos from "./pages/Shortsvideos";
import Music from "./pages/Music";
import UniversalLayout from "./layout/UniversalLayout";



/* 🔐 Auth guard */
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/auth/signin" replace />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Navigate to="/auth/signin" replace />;
    }
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/auth/signin" replace />;
  }

  return children;
};

/* ✅ ToastContainer global import */
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Hlayout from "./components/Help/Hlayout";
import Hdashboard from "./pages/Help/Hdashboard";
import Hsignin from "./pages/Help/Hsignin";
import Managment from "./pages/Help/Hmanagment";
import PrivacyHelp from "./pages/Help/Hprivacy";
import FinanceHelp from "./pages/Help/Hfinance";
import VideoAudioHelp from "./pages/Help/Hvideo&audio";
import TermsConditionsHelp from "./pages/Help/HTermsConditions";
import Profileclient from "./pages/Profileclientsaccess";
import Hlayoutguest from "./components/Help/Hlayoutguest";
import ResetPasswordToken from "./pages/Authentication/Resetpasstoken";
import ResetPasswordVerify from "./pages/Authentication/Resetpassverify";
import ArtistsList from "./pages/Players/Menplayers";
import ArtistProfile from "./pages/Players/ArtistProfile";
import ChangePassword from "./pages/Authentication/ChangePassword";
import Menplayers from "./pages/Players/Menplayers";
import Womenplayers from "./pages/Players/Womeplayers";

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <Loader />;

  return (
    <>
      {/* 🔹 Global ToastContainer for all pages */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
      />

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
          <Route path="auth/reset-token" element={<ResetPasswordToken />} />
          <Route path="auth/reset-password" element={<ResetPasswordVerify />} />

          {/*<Route path="home/watch/:hash" element={<Videosplaysample />} />*/}
        </Route>

       
        <Route element={<Hlayoutguest />}>
         <Route path="home/help" element={<Hdashboard />} />
         <Route path="home/help/signin" element={<Hsignin />} />
         <Route path="home/help/managment" element={<Managment />} />
         <Route path="home/help/privacy" element={<PrivacyHelp />} />
         <Route path="home/help/finance" element={<FinanceHelp/>} />
         <Route path="home/help/video&audio" element={<VideoAudioHelp/>} />
         <Route path="home/help/terms&condition" element={<TermsConditionsHelp/>} />
        </Route>


        {/* 🌍 PUBLIC + AUTH (shared) */}
        <Route element={<UniversalLayout />}>
          <Route path="reels" element={<Shortvideos />} />
          <Route path="highlights" element={<Trendsvideos />} />
          <Route path="watch/:hash" element={<Videosplay />} />
          {/*<Route path="music" element={<Music />} />*/}
          <Route path="home/search" element={<Search />} />
          <Route path="/mensplayers" element={<Menplayers />} />
          <Route path="/womensplayers" element={<Womenplayers />} />
        </Route>

        {/* 🔐 AUTHENTICATED APP */}
        <Route
          element={
            <RequireAuth>
              <DefaultLayout />
            </RequireAuth>
          }
        >
          <Route path="gaming" element={<Trendsvideos />} />
          <Route path="news" element={<Trendsvideos />} />
          <Route path="sports" element={<Trendsvideos />} />
          <Route path="traings" element={<Freevideos />} />
          {/*<Route path="myvideos" element={<Purchvideos />} />*/}
          <Route path="interviews" element={<Latestvideos />} />
          {/*<Route path="myprofile" element={<Profile />} />/}
          {/*<Route path="profile" element={<Profileclient />} />*/}
          <Route path="/profile" element={<ArtistProfile />} />
          <Route path="/profile/::hash" element={<ArtistProfile />} />
          <Route path="settings" element={<Settings/>} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>

         {/* 🔐 OLEEPLAY HELP */}
        <Route
          element={
            <RequireAuth>
              <Hlayout />
            </RequireAuth>
          }
        >
         <Route path="help" element={<Hdashboard />} />
         <Route path="help/signin" element={<Hsignin />} />
         <Route path="help/managment" element={<Managment />} />
         <Route path="help/privacy" element={<PrivacyHelp />} />
         <Route path="help/finance" element={<FinanceHelp/>} />
         <Route path="help/video&audio" element={<VideoAudioHelp/>} />
         <Route path="help/terms&condition" element={<TermsConditionsHelp/>} />
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
    </>
  );
}
