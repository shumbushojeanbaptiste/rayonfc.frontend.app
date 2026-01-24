import { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import CoverOne from '../images/cover/cover-01.png';
import userSix from '../images/user/user-06.png';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';
import { FaXTwitter, FaFacebookF, FaInstagram } from "react-icons/fa6";
import api from '../api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
    balance,
    currency,
  } = profile;

  const profileImage = profile_photo || userSix;

  return (
    <>
      <Breadcrumb pageName="Profile" />

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
            <img
              src={profileImage}
              alt="profile"
              className="rounded-full"
            />
          </div>

          {/* User Info */}
          <div className="mt-4">
            <h3 className="mb-1 text-xl sm:text-2xl font-semibold text-black dark:text-white">
              {first_name} {last_name}
            </h3>

            <p className="text-sm sm:text-base font-medium text-gray-500">
              {email}
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

            {/* About */}
            <div className="mx-auto max-w-xl">
              <h4 className="font-semibold text-black dark:text-white">
                About Me
              </h4>

              <p className="mt-3 text-sm sm:text-base leading-relaxed">
                Account created on{' '}
                <span className="font-medium">
                  {new Date(created_at).toDateString()}
                </span>
              </p>

             {/*  <p className="mt-2 text-sm sm:text-base">
                Balance:{' '}
                <span className="font-semibold">
                  {balance} {currency}
                </span>
              </p> */}
            </div>

            {/* Professional Icons */}
            <div className="mt-6">
              {/*<h4 className="mb-3 font-medium text-black dark:text-white">
                Find Us
              </h4>*/}

              <div className="flex items-center justify-center gap-4">
                {/* Facebook */}
                 <Link
                  to="#"
                  className="group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-stroke text-gray-400 transition hover:scale-110 hover:border-yellow-500 hover:text-yellow-500 dark:border-strokedark"
                >
                  <FaFacebookF className="text-lg sm:text-xl" />
                  <span className="absolute -top-9 scale-0 rounded bg-black px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                    Facebook
                  </span>
                </Link>

                {/* Instagram */}
                <Link
                  to="#"
                  className="group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-stroke text-gray-400 transition hover:scale-110 hover:border-yellow-500 hover:text-yellow-500 dark:border-strokedark"
                >
                  <FaInstagram className="text-lg sm:text-xl" />
                  <span className="absolute -top-9 scale-0 rounded bg-black px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                    Instagram
                  </span>
                </Link>

                {/* LinkedIn */}
                <Link
                  to="#"
                  className="group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-stroke text-gray-400 transition hover:scale-110 hover:border-yellow-500 hover:text-yellow-500 dark:border-strokedark"
                >
                  <FaLinkedin className="text-lg sm:text-xl" />
                  <span className="absolute -top-9 scale-0 rounded bg-black px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                    LinkedIn
                  </span>
                </Link>
               {/* X */}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
