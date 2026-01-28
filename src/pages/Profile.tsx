import { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import CoverOne from '../images/cover/cover-01.png';
import userSix from '../images/user/user-06.png';
import { Link } from 'react-router-dom';
import { FaLinkedin } from 'react-icons/fa';
import { FaXTwitter, FaFacebookF, FaInstagram } from "react-icons/fa6";
import api from '../api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Tabs state
  const [activeTab, setActiveTab] = useState('Home');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/accounts/details');
        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Profile" />
        <div className="p-10 text-center">Loading profile...</div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Breadcrumb pageName="Profile" />
        <div className="p-10 text-center text-red-500">
          Failed to load profile
        </div>
      </>
    );
  }

  const {
    first_name,
    last_name,
    email,
    profile_photo,
    created_at,
    followers,
    following,
    uploaded_videos,
  } = profile;

  const profileImage = profile_photo || userSix;

  return (
    <>
      <Breadcrumb pageName="" />

      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Cover */}
        <div className="relative z-20 h-32 sm:h-48 md:h-65">
          <img
            src={CoverOne}
            alt="profile cover"
            className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover"
          />
        </div>

        {/* Profile Body */}
        <div className="px-4 sm:px-6 pb-6 text-center lg:pb-8 xl:pb-11.5">
          {/* Avatar */}
          <div className="relative z-30 mx-auto -mt-16 sm:-mt-22 h-28 w-28 sm:h-44 sm:w-44 rounded-full bg-white/20 p-1 sm:p-3 backdrop-blur">
            <img src={profileImage} alt="profile" className="rounded-full" />
          </div>

          {/* Buttons under avatar */}
          <div className="mt-4 flex justify-center gap-4">
            <button
              className="rounded-full bg-gray-100 px-6 py-2 text-sm font-medium text-black transition hover:bg-gray-200"
            >
              Edit profile
            </button>
            <button
              className="rounded-full bg-gray-100 px-6 py-2 text-sm font-medium text-black transition hover:bg-gray-200"
            >
              Studio
            </button>
             <button
              className="rounded-full bg-gray-100 px-6 py-2 text-sm font-medium text-black transition hover:bg-gray-200"
            > 
              Finance
            </button>
          </div>

          {/* User Info */}
          <div className="mt-4">
            <h3 className="mb-1 text-xl sm:text-2xl font-semibold text-black dark:text-white">
              {first_name} {last_name}
            </h3>

            <p className="text-sm sm:text-base font-medium text-gray-500">
              {email}
            </p>

            <h4 className="font-semibold text-black dark:text-white">
              About Me
            </h4>

            <p className="mt-3 text-sm sm:text-base leading-relaxed">
              Account created on{' '}
              <span className="font-medium">
                {new Date(created_at).toDateString()}
              </span>
            </p>

            {/* Stats */}
            <div className="mx-auto mt-5 mb-6 grid w-full max-w-md grid-cols-3 rounded-md border border-stroke py-3 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
              <div className="flex flex-col items-center gap-1 border-r border-stroke dark:border-strokedark">
                <span className="font-semibold text-black dark:text-white">
                  {uploaded_videos}
                </span>
                <span className="text-xs sm:text-sm">Posts</span>
              </div>

              <div className="flex flex-col items-center gap-1 border-r border-stroke dark:border-strokedark">
                <span className="font-semibold text-black dark:text-white">
                  {followers}
                </span>
                <span className="text-xs sm:text-sm">Followers</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold text-black dark:text-white">
                  {following}
                </span>
                <span className="text-xs sm:text-sm">Following</span>
              </div>
            </div>

            {/* ================== MENU TABS ================== */}
            <div className="border-b border-stroke dark:border-strokedark mb-6">
              <ul className="flex flex-wrap justify-center gap-6 text-sm sm:text-base font-medium text-gray-500">
                {['Home', 'Videos', 'Shorts', 'Podcasts', 'Playlists', 'Posts'].map(tab => (
                  <li
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 cursor-pointer ${
                      activeTab === tab
                        ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                        : 'hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </li>
                ))}
              </ul>
            </div>
            {/* ================== END MENU ================== */}

            {/* ================== TAB CONTENT ================== */}
            <div className="mx-auto max-w-5xl text-left">

              {activeTab === 'Home' && (
                <>
                  <h4 className="font-semibold text-black dark:text-white">
                    About Me
                  </h4>

                  <p className="mt-3 text-sm sm:text-base leading-relaxed">
                    Account created on{' '}
                    <span className="font-medium">
                      {new Date(created_at).toDateString()}
                    </span>
                  </p>
                </>
              )}

              {activeTab === 'Videos' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="rounded-md border border-stroke p-3 dark:border-strokedark">
                      <img
                        src="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
                        alt="video"
                        className="rounded-md mb-2"
                      />
                      <p className="font-semibold">Video Title {i}</p>
                      <span className="text-xs text-gray-500">Views • Date</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Shorts' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[1,2,3,4,5,6].map(i => (
                    <div
                      key={i}
                      className="h-48 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                    >
                      Short {i}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Podcasts' && (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="rounded-md border border-stroke p-4 dark:border-strokedark">
                      🎧 Podcast Episode {i}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Playlists' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="rounded-md border border-stroke p-4 dark:border-strokedark">
                      ▶ Playlist {i}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Posts' && (
                <div className="space-y-4">
                  {[1,2].map(i => (
                    <div key={i} className="rounded-md border border-stroke p-4 dark:border-strokedark">
                      📝 Community post {i}
                    </div>
                  ))}
                </div>
              )}

            </div>
            {/* ================== END TAB CONTENT ================== */}

            {/* ================== SOCIAL ICONS (UNCHANGED) ================== */}
            <div className="mt-6">
              <div className="flex items-center justify-center gap-4">
                <Link
                  to="#"
                  className="group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-stroke text-gray-400 transition hover:scale-110 hover:border-yellow-500 hover:text-yellow-500 dark:border-strokedark"
                >
                  <FaFacebookF className="text-lg sm:text-xl" />
                  <span className="absolute -top-9 scale-0 rounded bg-black px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                    Facebook
                  </span>
                </Link>

                <Link
                  to="#"
                  className="group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-stroke text-gray-400 transition hover:scale-110 hover:border-yellow-500 hover:text-yellow-500 dark:border-strokedark"
                >
                  <FaInstagram className="text-lg sm:text-xl" />
                  <span className="absolute -top-9 scale-0 rounded bg-black px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                    Instagram
                  </span>
                </Link>

                <Link
                  to="#"
                  className="group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-stroke text-gray-400 transition hover:scale-110 hover:border-yellow-500 hover:text-yellow-500 dark:border-strokedark"
                >
                  <FaLinkedin className="text-lg sm:text-xl" />
                  <span className="absolute -top-9 scale-0 rounded bg-black px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                    LinkedIn
                  </span>
                </Link>

                <Link
                  to="#"
                  className="group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-stroke text-gray-400 transition hover:scale-110 hover:border-yellow-500 hover:text-yellow-500 dark:border-strokedark"
                >
                  <FaXTwitter className="text-lg sm:text-xl" />
                  <span className="absolute -top-9 scale-0 rounded bg-black px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                    X
                  </span>
                </Link>
              </div>
            </div>
            {/* ================== END SOCIAL ICONS ================== */}

          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
