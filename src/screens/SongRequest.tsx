import { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, onSnapshot, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore"; // Import Firebase Timestamp
import { searchSpotifySongs } from "../context/spotifyAPI";
import { Search } from "lucide-react";

// ✅ Type Definitions for Firestore Song Requests
interface SongRequest {
    id: string;
    title: string;
    artist: string;
    imageUrl: string;  // ✅ Fix: Added imageUrl to match Firestore data
    requestedBy: string;
    requestedByName: string;
    upvotes: string[];
    timestamp: Date;
}

// ✅ Type Definitions for Spotify Search Results
interface SpotifySong {
    id: string;
    name: string;
    artists: { name: string }[];
    albumImage: string;  // ✅ Fix: Added albumImage
}

// ✅ Type Definitions for Spotify Search Results
interface SpotifyTrack {
    id: string;
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[] };
}

// ✅ Props Interface
interface SongRequestProps {
    handleBack: () => void;
}

const SongRequest: React.FC<SongRequestProps> = ({ handleBack }) => {
    const [query, setQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<SpotifySong[]>([]);
    const [requests, setRequests] = useState<SongRequest[]>([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "songRequests"), (snapshot) => {
            setRequests(snapshot.docs.map((doc) => {
                const data = doc.data();

                return {
                    id: doc.id,
                    title: data.title || "Unknown Title",
                    artist: data.artist || "Unknown Artist",
                    imageUrl: data.imageUrl || "/default-image.png",  // ✅ Fix: Ensure `imageUrl` exists
                    requestedBy: data.requestedBy || "Unknown User",
                    requestedByName: data.requestedByName || "Anonymous",
                    upvotes: Array.isArray(data.upvotes) ? data.upvotes : [],
                    timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
                };
            }));
        });

        return () => unsubscribe();
    }, []);

    const handleSearch = async () => {
        if (!query.trim()) return;

        try {
            const results: SpotifyTrack[] = await searchSpotifySongs(query);

            // ✅ Safely extract album images, avoiding undefined errors
            const formattedResults: SpotifySong[] = results.map((track) => ({
                id: track.id,
                name: track.name,
                artists: track.artists,
                albumImage: track.album?.images?.[0]?.url || "/default-song-cover.png", // ✅ Fetch album cover properly
            }));

            setSearchResults(formattedResults);
        } catch (error) {
            console.error("Error fetching Spotify results:", error);
        }
    };


    // ✅ Add Requested Song
    const handleRequest = async (song: SpotifySong) => {
        if (!auth.currentUser) return alert("Please log in first!");

        try {
            await addDoc(collection(db, "songRequests"), {
                title: song.name,
                artist: song.artists[0]?.name || "Unknown Artist",
                imageUrl: song.albumImage,  // ✅ Save album image to Firestore
                requestedBy: auth.currentUser.uid,
                requestedByName: auth.currentUser.displayName || "Anonymous",
                upvotes: [],
                timestamp: new Date(),
            });

            setSearchResults([]); // Clear search results after adding
            setQuery(""); // Reset search input
        } catch (error) {
            console.error("Error adding song request:", error);
        }
    };

    // ✅ Handle Upvote
    const handleUpvote = async (id: string, upvotes: string[]) => {
        if (!auth.currentUser) return alert("Please log in first!");

        const songRef = doc(db, "songRequests", id);
        const userId = auth.currentUser.uid;

        if (upvotes.includes(userId)) {
            await updateDoc(songRef, { upvotes: arrayRemove(userId) });
        } else {
            await updateDoc(songRef, { upvotes: arrayUnion(userId) });
        }
    };

    // ✅ Handle Delete Request
    const handleDelete = async (id: string, requestedBy: string) => {
        if (!auth.currentUser) return alert("Please log in first!");
        if (auth.currentUser.uid !== requestedBy) return alert("You can only delete your own requests.");

        try {
            await deleteDoc(doc(db, "songRequests", id));
        } catch (error) {
            console.error("Error deleting song request:", error);
        }
    };

    const handleCancelSearch = () => {
        setSearchResults([]); // Clear search results
        setQuery(""); // Reset search input
    };


    return (
        <div className="absolute inset-0 w-full h-full rounded-md px-8 py-16 max-xs:px-1 max-xs:py-12">
            {/* 🔙 Back Button */}
            <button onClick={handleBack} className="flex absolute top-[10px] left-[10px] items-center justify-center gap-2 rounded-full bg-neutral-950 hover:bg-neutral-800 text-gray-300 size-8">
                <img className="w-[10px]" src="/assets/player ico/left-arrow.svg" alt="" />
            </button>

            <h2 className="text-3xl max-xs:text-xl font-bold max-xs:text-center">Request a Song</h2>

            {/* 🎵 Search for Songs */}
            <div className="mt-8 flex justify-between items-center gap-2 p-1">
                {/* <div className="text-lg max-xs:text-sm">Search your favorite songs</div> */}
                <div className="flex max-xs:w-full sm:min-w-full xl:min-w-[50%] gap-2">
                    <input
                        type="text"
                        placeholder="Search for a song?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()} // 🔹 Trigger search on Enter key
                        className="p-2 text-neutral-800 border rounded-full w-full"
                    />
                    <button onClick={handleSearch} className="">
                        <Search className="w-6 h-6 hover:text-green-400" />
                    </button>
                </div>
            </div>

            {/* 📌 Display Spotify Search Results */}
            {searchResults.length > 0 ? (
                <ul className="mt-4 bg-neutral-00 px-4 py-2.5 max-xs:px-1 max-xs:py-1 rounded h-[395px] max-xs:h-[420px] flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-center px-2 py-2">
                        <h3 className="text-white text-lg font-semibold">Select a Song to Request</h3>
                        {/* ❌ Cancel Button */}
                        <button
                            onClick={handleCancelSearch}
                            className="text-white text-sm"
                        >
                            <img className="w-6" src="/assets/player ico/cancel-ico.svg" alt="" />
                        </button>
                    </div>
                    {searchResults.map((song) => (
                        <li key={song.id} className="flex justify-between items-center p-2 hover:bg-neutral-700 mt-6 border-b-[1px] border-b-green-400 last:border-b-0 rounded-md">
                            <div className="flex items-center gap-3">
                                {/* 🎵 Album Cover */}
                                <img
                                    src={song.albumImage}
                                    alt={song.name}
                                    className="w-12 h-12 object-cover rounded-md"
                                />
                                <p className="text-white max-xs:text-sm">{song.name} - {song.artists[0]?.name}</p>
                            </div>
                            <button
                                onClick={() => handleRequest(song)}
                                className="rounded"
                            >
                                <div className="inline-flex items-center gap-3">
                                <h3 className="hidden lg:block text-sm font-semibold text-neutral-300 -mt-1">Request</h3>
                                <img src="/assets/player ico/request-ico.svg" alt="" />
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                /* 📌 Requested Songs (Only Show When Search is Inactive) */
                <div className="mt-4">
                    <ul className="flex flex-col overflow-y-auto bg-neutral-00 rounded-md h-[395px] max-xs:h-[420px] p-3 cursor-pointer">
                        <h3 className="text-xl font-semibold">Song Requests</h3>
                        {requests.length > 0 ? (
                            requests.map((song) => (
                                <li key={song.id} className="flex justify-between items-center p-2.5 mt-4 border-b-[1px] border-b-green-400 hover:bg-neutral-700 rounded-md">
                                    <div className="flex items-center gap-3">
                                        {/* 🎵 Album Cover */}
                                        <img
                                            src={song.imageUrl}  // ✅ Fix: Use imageUrl from Firestore
                                            alt={song.title}
                                            className="w-12 h-12 object-cover rounded-md"
                                        />
                                        <div>
                                            <p className="font-bold max-xs:text-xs">{song.title} - {song.artist}</p>
                                            <p className="text-[10px] font-semibold text-neutral-300">by {song.requestedByName}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 text-sm font-semibold">
                                        {/* 👍 Upvote Button */}
                                        <button onClick={() => handleUpvote(song.id, song.upvotes)}>
                                            <div className="inline-flex items-center gap-2">
                                                <img src="/assets/player ico/like-ico.svg" alt="" /> {song.upvotes.length}
                                            </div>
                                        </button>

                                        {/* 🗑️ Delete Button */}
                                        {auth.currentUser?.uid === song.requestedBy && (
                                            <button onClick={() => handleDelete(song.id, song.requestedBy)}
                                                className="text-white mt-3">
                                                <img className="w-8" src="/remove-ico-1.svg" alt="" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm mt-4">No song requests yet.</p>
                        )}
                    </ul>
                </div>
            )}

        </div>
    );
};

export default SongRequest;
