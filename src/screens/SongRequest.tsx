import { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, onSnapshot, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc, getDocs, query, where, getDoc } from "firebase/firestore";
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
    requestedByPhotoURL: string;  // ✅ Added Profile Photo Field
    requestedByUsers: { uid: string; name: string; photoURL: string }[]; // ✅ Store Multiple Users
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
    const [searchQuery, setSearchQuery] = useState<string>("");
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
                    requestedByPhotoURL: data.requestedByPhotoURL || "/default-profile.png", // ✅ Fetch Profile Photo
                    requestedByUsers: data.requestedByUsers || [], // ✅ Fetch all requesters
                    upvotes: Array.isArray(data.upvotes) ? data.upvotes : [],
                    timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
                };
            }));
        });

        return () => unsubscribe();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            const results: SpotifyTrack[] = await searchSpotifySongs(searchQuery);

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


    const handleRequest = async (song: SpotifySong) => {
        if (!auth.currentUser) return alert("Please log in first!");

        const user = {
            uid: auth.currentUser.uid,
            name: auth.currentUser.displayName || "Anonymous",
            photoURL: auth.currentUser.photoURL || "/default-profile.png",
        };

        try {
            const songRef = collection(db, "songRequests");

            // 🔹 Check if the song already exists
            const songQuery = query(
                songRef,
                where("title", "==", song.name),
                where("artist", "==", song.artists[0]?.name)
            );
            const querySnapshot = await getDocs(songQuery);

            if (!querySnapshot.empty) {
                // ✅ If song exists, update the existing request
                const existingDoc = querySnapshot.docs[0];
                const existingData = existingDoc.data() as {
                    requestedByUsers?: { uid: string; name: string; photoURL: string }[];
                };

                const requestedByUsers = existingData?.requestedByUsers || [];

                // 🔹 Check if the user has already requested this song
                const alreadyRequested = requestedByUsers.some((reqUser) => reqUser.uid === user.uid);
                if (alreadyRequested) {
                    alert("You have already requested this song!");
                    return;
                }

                // ✅ Append new user to the existing song request
                await updateDoc(doc(db, "songRequests", existingDoc.id), {
                    requestedByUsers: arrayUnion(user),
                });

            } else {
                // ✅ If song doesn't exist, add a new request
                await addDoc(songRef, {
                    title: song.name,
                    artist: song.artists[0]?.name || "Unknown Artist",
                    imageUrl: song.albumImage,
                    requestedByUsers: [user], // Store first requester
                    upvotes: [],
                    timestamp: new Date(),
                });
            }

            setSearchResults([]); // Clear search results after adding
            setSearchQuery(""); // Reset search input
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

    const handleDelete = async (id: string) => {
        if (!auth.currentUser) return alert("Please log in first!");

        try {
            const songRef = doc(db, "songRequests", id);
            const songSnap = await getDoc(songRef);

            if (!songSnap.exists()) return;

            const songData = songSnap.data();
            const updatedUsers = songData.requestedByUsers.filter((user: any) => user.uid !== auth.currentUser?.uid);

            if (updatedUsers.length === 0) {
                // ✅ If no users are left, delete the entire song request
                await deleteDoc(songRef);
            } else {
                // ✅ Otherwise, just update the document and remove the user
                await updateDoc(songRef, { requestedByUsers: updatedUsers });
            }
        } catch (error) {
            console.error("Error deleting user request:", error);
        }
    };

    const handleCancelSearch = () => {
        setSearchResults([]); // Clear search results
        setSearchQuery(""); // Reset search input
    };


    return (
        <div className="absolute inset-0 w-full h-full rounded-md px-8 py-16 max-xs:px-1 max-xs:py-12">
            {/* 🔙 Back Button */}
            <button onClick={handleBack} className="flex absolute top-[10px] left-[10px] items-center justify-center gap-2 rounded-full bg-neutral-950 hover:bg-neutral-800 text-gray-300 size-8">
                <img className="w-[10px]" src="/assets/player ico/left-arrow.svg" alt="" />
            </button>

            <h2 className="max-xs:text-[14px] md:text-[16px] lg:text-[24px] font-bold text-center mt-3">Every request tunes our library to perfection make your mark shape the music</h2>

            {/* 🎵 Search for Songs */}
            <div className="mt-12 flex justify-between items-center gap-2 p-1">
                {/* <div className="text-lg max-xs:text-sm">Search your favorite songs</div> */}
                <div className="flex max-xs:w-full sm:min-w-full xl:min-w-[50%] gap-2">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="What do you want to search?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()} // 🔹 Trigger search on Enter key
                            className={`p-2 pl-4 pr-10 text-sm font-semibold ${searchQuery ? "text-white" : "text-neutral-600"
                                } bg-neutral-800 rounded-full w-full transition-colors`}
                        />

                        {/* ❌ Clear Button (Inside Input) */}
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery(""); // ✅ Clear input text
                                    setSearchResults([]); // ✅ Close search results
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                <h3 className="p-2 pr-2 text-sm font-semibold">Clear</h3>
                            </button>
                        )}
                    </div>


                    <button onClick={handleSearch} className="">
                        <Search className="w-6 h-6 hover:text-green-400" />
                    </button>
                </div>
            </div>

            {/* 📌 Display Spotify Search Results */}
            {searchResults.length > 0 ? (
                <ul className="bg-neutral-00 px-4 py-2.5 max-xs:px-1 max-xs:py-1 rounded h-[375px] max-xs:h-[420px] flex flex-col overflow-y-auto">
                    <div className="flex justify-start items-center px-2 py-4">
                        <h3 className="text-xl font-extrabold text-green-400">Select a Song to Request</h3>
                        {/* ❌ Cancel Button */}
                        <button
                            onClick={handleCancelSearch}
                            className="text-white text-sm"
                        >
                            <div className="inline-flex items-center gap-3">
                                <h3 className="hidden lg:block text-base font-semibold text-neutral-300 hover:text-neutral-100 -mt-1"></h3>
                                {/* <img className="w-6" src="/assets/player ico/cancel-ico.svg" alt="" /> */}
                            </div>
                        </button>
                    </div>
                    {searchResults.map((song) => (
                        <li key={song.id} className="flex justify-between items-center p-2 hover:bg-neutral-700 mb-1 cursor-pointer border-b-[1px] border-b-green-400 last:border-b-0 rounded-md">
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
                <div className="mt-3">
                    <ul className="flex flex-col overflow-y-auto bg-neutral-00 rounded-md h-[350px] max-xs:h-[420px] p-3 cursor-pointer">
                        <h3 className="text-xl text-green-400 font-bold ml-2 mb-4">Song Requests</h3>
                        {requests.length > 0 ? (
                            requests.map((song) => (
                                <li key={song.id} className="flex justify-between items-center p-2.5 mb-1 border-b-[1px] border-b-green-400 hover:bg-neutral-700 rounded-md">
                                    <div className="flex items-center gap-3 w-full">
                                        {/* 🎵 Album Cover */}
                                        <img
                                            src={song.imageUrl}  // ✅ Fix: Use imageUrl from Firestore
                                            alt={song.title}
                                            className="w-12 h-12 object-cover rounded-md flex shrink-0"
                                        />
                                        <div className="min-w-0 flex-grow">
                                            <p className="font-bold max-xs:text-xs max-xsm:max-w-[160px] max-xs:max-w-[200px] max-w-[245px] md:max-w-[260px] lg:max-w-min text-white truncate">
                                                {song.title} - {song.artist}
                                            </p>

                                            {/* 🎭 Profile Picture Group (Hover to Show List) */}
                                            <div className="relative flex items-center -space-x-1 flex-wrap group cursor-pointer">
                                                {/* 🔹 Show Up to 3 Requesters' Profile Images */}
                                                {song.requestedByUsers.slice(0, 3).map((reqUser, index) => (
                                                    <img
                                                        key={index}
                                                        src={reqUser.photoURL || "/default-profile.png"}
                                                        alt={reqUser.name || "Anonymous"}
                                                        className="w-6 h-6 max-xs:w-5 max-xs:h-5 rounded-full object-cover border-2 border-neutral-600 hover:border-green-400 transition-all duration-200"
                                                    />
                                                ))}

                                                {/* ➕ Show "+X more" if there are additional users */}
                                                {song.requestedByUsers.length > 3 && (
                                                    <span className="text-xs font-semibold text-neutral-300 bg-neutral-800 px-2 py-1 rounded-full">
                                                        +{song.requestedByUsers.length - 3} more
                                                    </span>
                                                )}

                                                {/* 📝 Hoverable List of Requesters (Scrollable) */}
                                                <div className="absolute left-0 mt-2 bg-neutral-800 text-white text-xs rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-1 transition-all duration-300 w-max max-w-[200px] z-10">

                                                    <h4 className="font-semibold text-green-400 mb-1">Requested by:</h4>

                                                    <ul className="flex flex-col gap-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
                                                        {song.requestedByUsers.map((user, idx) => (
                                                            <li key={idx} className="flex items-center gap-2">
                                                                <img
                                                                    src={user.photoURL || "/default-profile.png"}
                                                                    alt={user.name || "Anonymous"}
                                                                    className="w-5 h-5 rounded-full object-cover"
                                                                    loading="eager" // ✅ Forces immediate loading (instead of lazy)
                                                                    referrerPolicy="no-referrer" // ✅ Prevents CORS issues with Google/Facebook profile images
                                                                    onError={(e) => (e.currentTarget.src = "/default-profile.png")} // ✅ Fallback if the image fails to load
                                                                />
                                                                <span className="text-white">{user.name || "Anonymous"}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                    <div className="flex gap-3 text-sm font-semibold min-w-[90px] justify-end">
                                        {/* 👍 Upvote Button */}
                                        <button className="inline-flex items-center gap-1" onClick={() => handleUpvote(song.id, song.upvotes)}>
                                                <img className="max-xs:w-4" src="/assets/player ico/like-ico.svg" alt="" />
                                                <span className="text-white">{song.upvotes.length}</span>
                                        </button>

                                        {/* 🗑️ Delete Button (Only if User Requested the Song) */}
                                        {song.requestedByUsers.some(user => user.uid === auth.currentUser?.uid) && (
                                            <button
                                                onClick={() => handleDelete(song.id)}
                                                className="text-white max-xs:mt-3 mt-3.5"
                                            >
                                                <img className="w-8 max-xs:w-6" src="/remove-ico-1.svg" alt="Delete" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-neutral-500 text-sm md:text-base text-center font-semibold mt-16">No song requests yet.</p>
                        )}
                    </ul>
                </div>
            )}

        </div>
    );
};

export default SongRequest;
