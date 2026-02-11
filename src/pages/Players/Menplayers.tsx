import { useEffect, useState } from 'react';
import api from '../../api';
import Donation from '../../components/balance/Donation';
import { useNavigate } from 'react-router-dom';


interface Artist {
  artist_id: number;
  name: string;
  avatar?: string;
  created_at: string;
  following: number;
}

const Menplayers = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    api
      .get('/api/accounts/creators')
      .then((res) => {
        const rawArtists = res.data?.data || [];

        const mappedArtists: Artist[] = rawArtists.map((artist: any) => ({
          artist_id: artist.user_id,
          name: [artist.first_name, artist.last_name].filter(Boolean).join(' '),
          avatar: artist.profile_photo,
          created_at:artist.created_at,
          following:artist.following,
        }));

        setArtists(mappedArtists);
      })
      .catch(() => {
        console.error('Failed to fetch artists');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading artists…</div>;
  }

  return (
    <>
     <div className="flex items-center px-6 gap-0.5 my-2">
    {/*<img src="/artisttwo.png" alt="" width="35" height="45" className="block" />*/}
      <span className="text-title-lg font-bold leading-none ">
        Men Players
      </span>
   </div>
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 p-6">
      {artists.map((artist) => (
        <div
          key={artist.artist_id}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 flex flex-col items-center text-center"
        >
          {/* Artist Avatar */}
          <div className="relative w-24 h-24 mb-4">
            <img
              src={artist.avatar || '/avatar.png'}
              alt={artist.name}
              className="w-full h-full rounded-full object-cover border-4 border-blue-600"
            />
          </div>

          {/* Artist Name */}
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {artist.name}
          </h3>

         {/* <p className="mt-3 text-sm sm:text-base leading-relaxed">
              Account created on{' '}
              <span className="font-medium">
                {new Date(artist.created_at).toDateString()}
              </span>
            </p>
             */}

          {/* Optional description or stats */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {/* You can add followers, balance, etc. here */}
          </p>

          {/* Donate Button */}
         <Donation artistId={artist.artist_id} />  

{/* Profile Button */}
<button
  onClick={() => {
    const artistProfile = {
      artist_id: artist.artist_id,
      name: artist.name,
      avatar: artist.avatar,
      created_at: artist.created_at,
      following: artist.following,
    };

    // ✅ store artist for refresh support
    sessionStorage.setItem(
      'artist_profile',
      JSON.stringify(artistProfile)
    );

    // ✅ navigate without ID in URL
    navigate('/profile', {
      state: artistProfile,
    });
  }}
  className="mt-3 w-full rounded-full border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-500 hover:text-white"
>
  View Profile
</button>

        </div>
      ))}
    </div>
    </>
  );
};

export default Menplayers;
