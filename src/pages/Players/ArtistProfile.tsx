import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import CoverOne from '../../images/cover/cover-01.png';
import { FaFacebookF, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import api from '../../api';
import CardDataStatsTre from '../../components/CardDataStatsTre';
import { toast } from "react-toastify"; // ✅ import toast
import { useNavigate } from "react-router-dom";
import { getAuthUser } from '../../utils/auth';
import { encodeId } from '../../utils/hashid';
import BuyVideoModal from '../../components/SubscribePlanModal';
import Donation from '../../components/balance/Donation';

interface Comment {
  id: number;
  user: string;
  text: string;
}

interface Video {
 id: number;
  title: string;
  price: number;
  duration: string;
  ref?: string; // needed for payment check
  thumbnail?: string;
  profile_photo?: string;
  owner?: string;
  views?: number;
  first_name?: string;
  last_name?: string;
  created_at?: string;
}

const ArtistProfile = () => {

  const [videos, setVideos] = useState<Video[]>([]);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Videos');
  const location = useLocation();
  const navigate = useNavigate();
  const user = getAuthUser();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  
  const fileUrl = (path?: string) =>
    path && path !== "null" && path !== "undefined"
      ? path
      : "/default-avatar.png";

const artist =
  (location.state as {
    artist_id?: number;
    name?: string;
    avatar?: string;
    created_at?: string;
    following?: number;
  }) ||
  JSON.parse(sessionStorage.getItem('artist_profile') || 'null');

const artistId = artist?.artist_id;


if (!artistId) {
  return (
    <div className="text-center py-20 text-gray-500">
      Artist not found
    </div>
  );
}


const handleVideoClick = (video: Video) => {
    if (!user) {
      toast.error("Please login first"); // ✅ replaced alert
      return;
    }

    if (!video.price || Number(video.price) === 0) {
      navigate(`/watch/${encodeId(video.id)}`, {
        state: { ...video, source: "trending" },
      });
      return;
    }

    setSelectedVideo(video);
  };

   const refreshWallet = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/api/payments/balance/${user.user_id}`);
        setWalletBalance(Number(res.data?.data?.balance || 0));
      } catch {
        setWalletBalance(0);
      }
    };

      useEffect(() => {
        if (user) refreshWallet();
      }, [user]);
    




   useEffect(() => {
  if (!artistId) return;

  const fetchVideos = api.get(`/api/videos/aritist/list/${artistId}`);

  const fetchFollowers = api.post(
    'api/metadata/followers/count',
    { user_id: artistId }
  );

  Promise.all([fetchVideos, fetchFollowers])
    .then(([videosRes, followersRes]) => {
      setVideos(videosRes.data?.data || []);
      setFollowers(followersRes.data?.data?.followers || 0);
    })
    .catch(() => {
      console.error('Failed to load artist data');
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
        <div className="relative mx-auto -mt-14 sm:-mt-16 h-32 w-32 rounded-full bg-white p-2 shadow-lg sm:h-40 sm:w-40">
          <img
            src={artist?.avatar || '/default-avatar.png'}
            alt={artist?.name || 'Artist'}
            className="w-full h-full rounded-full object-cover border-4 border-yellow-400"
           />

        </div>

        {/* Name & CTA */}
        <h2 className="mt-4 text-2xl font-bold text-black dark:text-white">
          {artist?.name || 'Artist'}
        </h2>

         <p className="mt-3 text-sm sm:text-base leading-relaxed">
              Account created on{' '}
              <span className="font-medium text-slate-100">
                {artist?.created_at
                ? new Date(artist.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                   })
                   : 'Unknown date'}
              </span>
            </p>

        <div className="mt-4 flex justify-center gap-4">
          <Donation artistId={artistId} />

          
          {/* <button className="rounded-full border px-6 py-2 text-sm font-medium">
                  Message
              </button>
          */}

        </div>

        {/* ================= STATS ================= */}
        <div className="mx-auto mt-6 grid max-w-md grid-cols-3 rounded-md border py-3 text-center dark:border-strokedark">
          <div>
            <p className="font-semibold">{videos.length}</p>
            <span className="text-xs text-gray-500">Videos</span>
          </div>
          <div className="border-x dark:border-strokedark">
            <p className="font-semibold">{followers}</p>
            <span className="text-xs text-gray-500">Followers</span>
          </div>
          <div>
            {/* Likes count not fetched from backend yet, so hardcoded 0 */}
            <p className="font-semibold">{artist?.following}</p>
            <span className="text-xs text-gray-500">Following</span>
          </div>
        </div>

        {/* ================= TABS ================= */}
        <div className="mt-8 border-b dark:border-strokedark">
          <ul className="flex justify-center gap-4 overflow-x-auto whitespace-nowrap px-2 font-medium text-gray-500">
            {['Videos', 'Audio', 'Albums', 'Reels', ].map(tab => (
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
            <div className="px-0 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2">
              {videos.map(video => (
                
              <CardDataStatsTre
                key={video.id}
                id={video.id}
                videoTitle={video.title}
                channelName={video.owner || "Unknown Owner"}
                total={`${video.views ?? 0} views`}
                price={video.price}
                duration={video.duration} 
                thumbnail={fileUrl(video.thumbnail)}
                profileImage={fileUrl(video.profile_photo || video.thumbnail)}
                onClick={() => handleVideoClick(video)}
              />


              ))}
            </div>
  

          )}
          <div>

        {selectedVideo && (
        <BuyVideoModal
          video={selectedVideo}
          walletBalance={walletBalance}
          onClose={() => setSelectedVideo(null)}
          onSuccess={() => {
            refreshWallet();
            setSelectedVideo(null);
            toast.success("Video purchased successfully!"); // ✅ optional toast
          }}
        />
      )}
          </div>

            {activeTab === 'Audio' && (
            <div className="py-10 text-center text-gray-400">
              No Audio
            </div>
          )}

          {activeTab === 'Albums' && (
            <div className="py-10 text-center text-gray-400">
              No Album
            </div>
          )}

          {activeTab === 'Reels' && (
            <div className="py-10 text-center text-gray-400">
              No Reel
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
