import { ChevronRight, Library, Search} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Album } from "../types"; // ✅ Import from the same source
import { Dispatch, SetStateAction } from "react";


interface SidebarProps {
    favoriteAlbums: Album[];
    setFavoriteAlbums: Dispatch<SetStateAction<Album[]>>;
}


// interface SidebarProps {
//     favoriteAlbums: Album[];
//     setFavoriteAlbums: React.Dispatch<React.SetStateAction<Album[]>>;
// }

const Sidebar: React.FC<SidebarProps> = ({ favoriteAlbums, setFavoriteAlbums }) => {
    
    const { removeFavoriteAlbum } = useAuth();
    const [popupMessage, setPopupMessage] = useState<string>("");

    const handleRemoveAlbum = (album: Album) => {
        removeFavoriteAlbum?.(album);

        // ✅ Update the favoriteAlbums state in App.tsx
        setFavoriteAlbums((prev) => prev.filter((fav) => fav.id !== album.id));

        setPopupMessage("Removed Album Successfully");
        setTimeout(() => setPopupMessage(""), 3000);
    };


    return (
        <div className="w-[30%] max-h-[90%] max-md:hidden flex flex-col p-6 md:p-1 lg:p-6 bg-neutral-900 text-white rounded-md relative">
            {/* Popup Notification */}
            {popupMessage && (
                <div className="hidden absolute top-4 left-1/2 transform -translate-x-1/2 bg-white text-black text-sm lg:text-base font-semibold px-4 py-2 rounded-lg shadow-lg transition-opacity duration-500">
                    {popupMessage}
                </div>
            )}

            {/* Library section */}
            <div className="flex justify-between w-full min-h-max px-1 py-4">
                <div className="flex gap-2">
                    <button className="hover:text-green-400 transition">
                        <Library className="w-6 h-6" />
                    </button>
                    <h2>Library</h2>
                </div>
                <button>
                    <ChevronRight className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Artists and other section */}
            <div className="flex gap-2 mt-4">
                <button className="bg-neutral-700 rounded-full text-center font-normal px-3 py-1.5 text-sm">Liked Albums</button>
            </div>

            {/* Search and Recents section */}
            <div className="flex items-baseline justify-between w-full px-1 py-4 mt-4">
                <button className="hover:text-green-400 transition">
                    <Search className="w-5 h-5" />
                </button>
                <button className="hover:text-green-400 transition flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold -translate-y-0.5">Recents</h3>
                    <img className="w-5 h-5" src="/assets/player ico/recent-ico.svg" alt="" />
                </button>
            </div>

            {/* Favorite Albums List */}
            <div className="min-h-[256px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-neutral-900 px-1 py-4 rounded-lg mt-4">
                <div className="flex flex-col space-y-4">
                    {favoriteAlbums.length > 0 ? (
                        favoriteAlbums.map((album: Album) => (
                            <div key={album.id} className="flex items-center gap-4 justify-between group hover:bg-neutral-800 p-2 rounded-md cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <img className="size-12 md:size-10 object-cover object-center rounded-full" src={album.image} alt="" />
                                    <div>
                                        <p className="text-sm md:text-xs lg:text-sm font-bold text-neutral-200">{album.name}</p>
                                        <p className="text-sm md:text-[10px] lg:text-xs font-semibold text-neutral-400">{album.artist}</p>
                                    </div>
                                </div>

                                {/* ✅ Remove Button (Visible on Hover) */}
                                <button
                                    onClick={() => handleRemoveAlbum(album)}
                                    className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-400"
                                    title="Remove Album"
                                >
                                    <img className="w-6 transition" src="/assets/player ico/remove-album.svg" alt="" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-neutral-400 text-center">No favorite albums yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
