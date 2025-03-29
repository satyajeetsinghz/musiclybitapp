import { Play, X } from "lucide-react";
import { albums, topPicks } from "../assets/assets";
import { useMusic } from "../context/MusicContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Dispatch, SetStateAction } from "react";
import { Album, Song } from "../types"; // ✅ Ensure all files use the same Album type
import MusicPage from "./MusicPage";
import SongRequest from "./SongRequest";


interface MainContentProps {
    setFavoriteAlbums: Dispatch<SetStateAction<Album[]>>;
    favoriteAlbums: Album[]; // ✅ Add this line
}

const MainContent: React.FC<MainContentProps> = ({ setFavoriteAlbums, favoriteAlbums }) => {
    const music = useMusic(); // ✅ Correctly retrieve context
    const { setCurrentSong, setIsPlaying } = music;
    const { user, popupMessage, setPopupMessage, removeFavoriteAlbum } = useAuth(); // Access globally define function here
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
    const [showAlbums, setShowAlbums] = useState(false); // ✅ State for Album Sidebar
    const [activeButton, setActiveButton] = useState("All"); // ✅ Track active button
    const [activePage, setActivePage] = useState("All");

    useEffect(() => {
        if (!showAlbums) {
            setActiveButton("All"); // ✅ Reset to All when mobile sidebar is closed
        }
    }, [showAlbums]);

    const handlePlaySong = (song: Partial<Song>) => {
        if (!song.audio) return;
        setCurrentSong?.(song as Song);
        setIsPlaying?.(true);
    };

    const handleAlbumClick = (album: Album) => {
        const formattedAlbum: Album = {
            ...album,
            id: String(album.id), // ✅ Convert `id` to string
            songs: (album.songs ?? []).map((song, index) => ({ // ✅ Ensure `songs` is always an array
                ...song,
                id: song.id ? String(song.id) : String(index + 1), // ✅ Ensure `id` is a string
            })),
        };

        setSelectedAlbum(formattedAlbum);
        setActiveButton("Albums"); // ✅ Set Albums button active when album is clicked
    };



    const handleBack = () => {
        setSelectedAlbum(null);
        setActiveButton("All");
        setActivePage("All");
    };

    const addFavoriteAlbum = async (album: Album) => {
        if (!user) return;

        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            let existingFavorites: Album[] = [];
            if (userSnap.exists()) {
                existingFavorites = userSnap.data().favorites || [];
            }

            // ✅ Check if the album already exists in Firestore
            const isAlreadyFavorite = existingFavorites.some(fav => fav.id === String(album.id));
            if (isAlreadyFavorite) {
                setPopupMessage("Album already in your library");
                setTimeout(() => setPopupMessage(""), 3000);
                return;
            }

            // ✅ Add album only if it doesn't exist
            const updatedFavorites = [...existingFavorites, { ...album, id: String(album.id) }];
            await updateDoc(userRef, { favorites: updatedFavorites });

            setFavoriteAlbums(updatedFavorites); // ✅ Update state immediately

            setPopupMessage("Added to your library");
            setTimeout(() => setPopupMessage(""), 3000);
        } catch (error) {
            console.error("Error adding album: ", error);
        }
    };

    const handleRemoveAlbum = (album: Album) => {
        removeFavoriteAlbum?.(album);

        // ✅ Update the favoriteAlbums state in App.tsx
        setFavoriteAlbums((prev) => prev.filter((fav) => fav.id !== album.id));

        setPopupMessage("Removed Album Successfully");
        setTimeout(() => setPopupMessage(""), 3000);
    };




    return (
        <div className="w-[70%] max-md:w-full max-h-[90%] max-md:max-h-[92%] max-md:px-1 bg-neutral-900 text-white rounded-md relative">

            {/* Popup Notification */}
            {popupMessage && (
                <div className="absolute bottom-[20px] left-1/2 transform -translate-x-1/2 bg-white text-black text-sm max-xs:text-xs max-xs:min-w-max lg:text-base font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-opacity duration-500">
                    {/* <CheckCircle className="text-green-400" size={20} /> */}
                    {popupMessage}
                </div>
            )}

            {/* Albums Sidebar (Slide-in effect) only for Mobile device */}
            <div
                className={`absolute top-0 left-0 h-full w-[60%] max-md:w-[65%] bg-neutral-900 text-white transition-transform duration-300 ease-in-out z-40 md:hidden ${showAlbums ? "translate-x-0 visible" : "-translate-x-full invisible"
                    }`}
            >
                <div className="p-4 flex justify-between items-center border-b border-neutral-700">
                    <h2 className="text-sm font-bold">Liked Album</h2>
                    <button onClick={() => setShowAlbums(false)}>
                        <X className="w-5 h-5 text-green-400 hover:text-white transition" />
                    </button>
                </div>

                <div className="py-4 px-2 overflow-y-auto max-h-[80vh]">
                    {favoriteAlbums.length > 0 ? (
                        favoriteAlbums.map((album, index) => (
                            <div key={index} className="flex items-center justify-between gap-3 p-2 hover:bg-neutral-800 rounded-md">
                                <div className="flex items-center gap-3">
                                    <img src={album.image} alt={album.name} className="w-12 h-12 rounded-full" />
                                    <div>
                                        <h3 className="text-[10px] font-semibold">{album.name}</h3>
                                        <p className="text-[9px] text-gray-400">{album.artist}</p>
                                    </div>
                                </div>
                                <button className="pr-2" onClick={() => handleRemoveAlbum(album)}>
                                    <img className="transition" src="/assets/player ico/remove-album.svg" alt="" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm mt-4 text-center">No favorite albums yet.</p>
                    )}
                </div>
            </div>

            {/* Show Album Details if an Album is Selected */}
            {selectedAlbum ? (
                <div className="bg-neutral-00 min-h-[100%] rounded-md flex flex-col h-full">
                    {/* Album Cover & Artist Info */}
                    <div className="flex flex-col items-start gap-4 mb-0 relative h-[40%] md:h-[40%] lg:h-[45%]">
                        {/* Back Button */}
                        <button onClick={handleBack} className="flex absolute top-[6px] left-[10px] items-center justify-center gap-2 rounded-full bg-neutral-950 hover:bg-neutral-800 text-gray-300 size-8">
                            <img className="w-[10px]" src="/assets/player ico/left-arrow.svg" alt="" />
                        </button>
                        <img className="w-full h-full object-cover object-center rounded-t-md" src={selectedAlbum.cover} alt={selectedAlbum.name} />
                        {/* Black shade */}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent opacity-90"></div>
                        <div className="px-5 py-2 absolute bottom-[30px] left-0">
                            <p className="text-4xl max-md:text-2xl text-white font-extrabold">{selectedAlbum.artist}</p>
                        </div>
                    </div>
                    <div className="px-6 pb-4 flex flex-col bg-cyan-00 overflow-y-auto h-[60%] md:h-[60%] lg:h-[55%]">

                        {/* Latest Songs List */}
                        <h3 className="text-2xl font-bold mt-4 mb-2">Popular</h3>
                        <div className="space-y-2 mt-3">
                            {/* Header Row */}
                            <div className="flex justify-between items-center w-full h-10 px-6 text-sm text-neutral-400 font-semibold border-b border-neutral-700">
                                <div className="flex items-center gap-4 w-[40%] min-w-[200px]">
                                    <span>#</span>
                                    <h2>Title</h2>
                                </div>
                                <h2 className="w-[25%] min-w-[150px] hidden lg:block">Album</h2>
                                <h2 className="w-[20%] min-w-[120px] text-center">Date Added</h2>
                                <h2 className="w-[10%] min-w-[80px] text-right hidden lg:block pr-6">Time</h2>
                            </div>

                            {(selectedAlbum.songs ?? []).map((song, index) => (
                                <div
                                    onClick={() => handlePlaySong(song)}
                                    key={song.id || index}
                                    className="flex items-center justify-between max-xsm:w-[330px] hover:bg-neutral-800 px-6 py-3 rounded-md cursor-pointer"
                                >
                                    {/* Song Index, Cover Image & Details */}
                                    <div className="flex items-center gap-4 w-[40%] min-w-[200px]">
                                        <span className="text-base text-gray-300 font-semibold">{index + 1}</span>
                                        <img src={song.image} alt={song.title} className="w-10 h-10 object-cover rounded-md" />
                                        <div>
                                            <h4 className="text-sm font-medium text-white">{song.title}</h4>
                                            <p className="text-xs text-gray-400">{selectedAlbum.artist}</p>
                                        </div>
                                    </div>

                                    {/* Album Name */}
                                    <div className="w-[25%] min-w-[150px] hidden lg:block">
                                        <h2 className="text-sm font-medium text-gray-400">{selectedAlbum.name}</h2>
                                    </div>

                                    {/* Date Added */}
                                    <div className="w-[20%] min-w-[120px] text-center">
                                        <h2 className="text-sm font-medium text-gray-400">{song.dateAdded || "-"}</h2>
                                    </div>

                                    {/* Song Duration */}
                                    <div className="w-[10%] min-w-[80px] text-right hidden lg:block pr-6">
                                        <h2 className="text-sm font-medium text-gray-400">3:56</h2>
                                    </div>
                                </div>
                            ))}
                        </div>



                        {/* About artist  */}
                        <div className="mt-8 mb-2">
                            <h2 className="text-2xl font-bold">About</h2>
                            <div className="relative w-full h-[256px] lg:h-[345px] bg-red-00 mt-4 rounded-md overflow-hidden">
                                <img className="w-full h-full object-cover object-center absolute opacity-70" src={selectedAlbum.aboutCover} alt="" />
                                {/* Black shade */}
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent opacity-90"></div>
                                <div className="absolute bottom-[40px] left-0 w-[70%] lg:w-[50%] max-h-min ml-8 flex flex-col items-start space-y-0.5">
                                    <h2 className="text-[11px] md:text-[16px] font-semibold">79,567,323,78 monthly listeners</h2>
                                    <h2 className="text-[11px] md:text-[16px] font-semibold">Ed Sheeran live concert this April, Summer Music Fest 2025 hits.</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="px-6 py-4">
                        {/* Dynamic Page Rendering */}
                        {activePage === "Music" && <MusicPage handleBack={() => {
                            setActivePage("All")
                            setActiveButton("All");  // Reset active button
                        }} />}
                        {activePage === "Request" && <SongRequest handleBack={() => {
                            setActivePage("All")
                            setActiveButton("All");  // Reset active button
                        }} />}

                        {activePage === "All" && (
                            <>
                                {/* Navigation Options and User Profile icon */}
                                <div className="flex items-center gap-3 mx-1.5 mt-2">
                                    <button
                                        className={`${activeButton === "All" ? "bg-green-400" : "bg-neutral-700"} text-white max-md:text-[10px] text-sm text-center max-md:px-3 max-md:py-1 px-5 py-1.5 rounded-full`}
                                        onClick={() => {
                                            setActiveButton("All")
                                            setActivePage("All");
                                        }}

                                    >
                                        All
                                    </button>
                                    <button
                                        className={`${activeButton === "Music" ? "bg-green-400" : "bg-neutral-700"} text-white max-md:text-[10px] text-sm text-center max-md:px-3 max-md:py-1 px-5 py-1.5 rounded-full`}
                                        onClick={() => {
                                            setActiveButton("Music");
                                            setActivePage("Music");
                                        }}
                                    >
                                        Music
                                    </button>
                                    {/* Albums Button (Only for Mobile) */}
                                    <button
                                        className={`${activeButton === "Library" ? "bg-green-400" : "bg-neutral-700"} text-white max-md:text-[10px] text-sm text-center max-md:px-3 max-md:py-1 px-5 py-1.5 rounded-full md:hidden`}
                                        onClick={() => {
                                            setShowAlbums(true);
                                            setActiveButton("Library");
                                        }}
                                    >
                                        Library
                                    </button>
                                    <button
                                        className={`${activeButton === "Request" ? "bg-green-400" : "bg-neutral-700"} text-white max-md:text-[10px] text-sm text-center max-md:px-3 max-md:py-1 px-5 py-1.5 rounded-full`}
                                        onClick={() => {
                                            setActiveButton("Request");
                                            setActivePage("Request")
                                        }}
                                    >
                                        Request
                                    </button>
                                </div>
                                {/* Navigation Options and User Profile icon ends */}

                                {/* Top Albums Section */}
                                <div className="w-full min-h-max bg-neutral-00 mt-8 rounded-md">
                                    <div className="grid grid-cols-2 gap-3 px-2 max-xs:px-0 py-3">
                                        {albums.map((album) => (
                                            <div key={album.id} onClick={() => handleAlbumClick(album)} className="w-full max-md:h-10 h-14 bg-neutral-800 hover:bg-neutral-700 rounded-md relative group cursor-pointer">
                                                <div className="flex items-center">
                                                    <img className="size-14 max-md:size-10 object-center object-cover rounded-l-md" src={album.image} alt={album.name} />
                                                    <h3 className="ml-2 max-md:text-[12px] font-bold text-white">{album.name}</h3>
                                                </div>

                                                <button onClick={(e) => { e.stopPropagation(); addFavoriteAlbum(album); }} className="absolute max-md:bottom-[6px] bottom-[12px] max-md:right-[8px] right-[10px] max-md:text-[12px] opacity-0 group-hover:opacity-100 bg-reen-500 rounded-full hover:bg-reen-400 transition p-1.5">
                                                    <img className="w-6 transition" src="/assets/player ico/add-ico.svg" alt="" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Top Albums Section ends */}

                                {/* Top Picks Section */}
                                <div className="w-full min-h-max bg-neutral-00 mt-8 rounded-md">
                                    <div className="pb-3 py-1">
                                        <h2 className="text-2xl max-md:text-xl font-bold ml-2">Top Picks</h2>
                                        <div className="flex overflow-x-auto gap-4">
                                            {topPicks.map((pick) => (
                                                <div key={pick.id} onClick={() => handlePlaySong(pick)} className="relative w-[160px] max-md:min-w-[160px] md:min-w-[160px] h-[200px] max-md:min-h-[190px] p-2 bg-transparent hover:bg-neutral-800 mt-4 rounded-md group cursor-pointer">
                                                    <img className="w-[180px] h-[130px] object-cover object-center rounded-md" src={pick.image} alt={pick.title} />
                                                    <p className="pl-0.5 mt-2 text-sm max-md:text-[12px] font-semibold text-neutral-300">{pick.title}</p>
                                                    <p className="pl-0.5 mt-0.5 max-md:mt-0 text-xs max-md:text-[10px] font-semibold text-neutral-300">{pick.artist}</p>
                                                    <button className="absolute bottom-[70px] bg-green-500 rounded-full hover:bg-green-400 transition p-1.5 max-md:bottom-[70px] right-[16px] text-base opacity-0 group-hover:opacity-100">
                                                        <Play className="w-4 h-4 text-black" fill="black" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Top Picks Section */}
                            </>
                        )}
                    </div>
                </>
            )
            }
        </div >
    );
};

export default MainContent;
