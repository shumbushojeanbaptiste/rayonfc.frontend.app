import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import CoverOne from '../../images/cover/cover-01.png';
import userSix from '../../images/user/user-06.png';

import { FaFacebookF, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import api from '../../api';
import {ThumbsUp } from 'lucide-react';

interface Comment {
  id: number;
  user: string;
  text: string;
}

interface Video {
  id: number;
  title: string;
  thumbnail: string;
  video_url: string;
  views: number;
  duration: string;
  likes: number;
  dislikes: number;
  price: string;
}

const ArtistProfile = () => {
  const { artistId } = useParams<{ artistId: string }>();

  const [videos, setVideos] = useState<Video[]>([]);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Videos');

   useEffect(() => {
      if (!artistId) return;
  
      // Fetch artist videos
      const fetchVideos = api.get(`/api/videos/aritist/list/${artistId}`);
  
      // Fetch followers count
      const fetchFollowers = api.post(
        'api/metadata/followers/count',
        {
          user_id: Number(artistId),
        }
      );
  
      Promise.all([fetchVideos, fetchFollowers])
        .then(([videosRes, followersRes]) => {
          setVideos(videosRes.data?.data || []);
          setFollowers(followersRes.data?.data?.followers || 0);
        })
        .catch((err) => {
          console.error('Failed to load artist data', err);
        })
        .finally(() => setLoading(false));
    }, [artistId]);

if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading artist…</div>;
  }

  if (videos.length === 0) {
    return <div className="text-center py-20 text-gray-500">No videos found</div>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* ================= COVER ================= */}
      <div className="relative h-32 sm:h-48 md:h-64">
        <img
          src={CoverOne}
          className="h-full w-full object-cover rounded-t-sm"
          alt="cover"
        />
      </div>

      {/* ================= PROFILE BODY ================= */}
      <div className="px-4 pb-6 text-center sm:px-6 lg:pb-8">
        {/* Avatar */}
        <div className="relative mx-auto -mt-16 h-32 w-32 rounded-full bg-white p-2 shadow-lg sm:h-40 sm:w-40">
          <img src="/default-avatar.png" alt="profile" className="rounded-full" />
        </div>

        {/* Name & CTA */}
        <h2 className="mt-4 text-2xl font-bold text-black dark:text-white">
          Artist Name
        </h2>
        <p className="text-gray-500">Professional Music Creator</p>

        <div className="mt-4 flex justify-center gap-4">
          <button className="rounded-full bg-yellow-400 px-6 py-2 text-sm font-medium text-black hover:bg-yellow-500">
            Follow
          </button>
          <button className="rounded-full border px-6 py-2 text-sm font-medium">
            Message
          </button>
        </div>

        {/* ================= STATS ================= */}
        <div className="mx-auto mt-6 grid max-w-md grid-cols-3 rounded-md border py-3 text-center dark:border-strokedark">
          <div>
            <p className="font-semibold">{videos.length}</p>
            <span className="text-xs text-gray-500">Videos</span>
          </div>
          <div className="border-x dark:border-strokedark">
            <p className="font-semibold">{followers}</p>
            <span className="text-xs text-gray-500">{followers} Followers</span>
          </div>
          <div>
            {/* Likes count not fetched from backend yet, so hardcoded 0 */}
            <p className="font-semibold">0</p>
            <span className="text-xs text-gray-500">Likes</span>
          </div>
        </div>

        {/* ================= TABS ================= */}
        <div className="mt-8 border-b dark:border-strokedark">
          <ul className="flex justify-center gap-6 text-sm font-medium text-gray-500">
            {['Videos', 'Shorts', 'Podcasts', 'Playlists', 'Posts'].map(tab => (
              <li
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer pb-3 ${
                  activeTab === tab
                    ? 'border-b-2 border-black text-black dark:border-white dark:text-white'
                    : 'hover:text-black dark:hover:text-white'
                }`}
              >
                {tab}
              </li>
            ))}
          </ul>
        </div>

        {/* ================= TAB CONTENT ================= */}
        <div className="mx-auto mt-6 max-w-6xl text-left">
          {activeTab === 'Videos' && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {videos.map(video => (
                <div
            key={video.id}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-44 object-cover"
            />

            <div className="p-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
                {video.title}
              </h3>

              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{video.views} views</span>
                <span>{video.duration} min</span>
              </div>

              <div className="flex text-sm mt-2 gap-2">
                <ThumbsUp/>
                <span className='mt-1'> {video.likes}</span>
              </div>

              {video.price !== '0.00' && (
                <div className="mt-2 text-yellow-500 font-semibold">
                  {video.price} RWF
                </div>
              )}

             {/*  <a
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center rounded-full bg-yellow-400 py-2 text-sm font-medium text-black hover:bg-yellow-500"
              >
                Watch Video
              </a>
              */}
            </div>
          </div>


              ))}
            </div>


          )}

          {activeTab !== 'Videos' && (
            <div className="py-10 text-center text-gray-400">
              Content coming soon…
            </div>
          )}
        </div>

        {/* ================= SOCIALS ================= */}
        <div className="mt-8 flex justify-center gap-4">
          {[FaFacebookF, FaInstagram, FaLinkedin, FaXTwitter].map(
            (Icon, i) => (
              <Link
                key={i}
                to="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border text-gray-400 transition hover:scale-110 hover:border-yellow-500 hover:text-yellow-500"
              >
                <Icon />
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;
