import { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, onSnapshot, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore"; // Import Firebase Timestamp
import { searchSpotifySongs } from "../context/spotifyAPI";

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

    return (
        <div className="p-6">
            {/* 🔙 Back Button */}
            <button onClick={handleBack} className="absolute top-2 left-2 bg-gray-800 text-white px-3 py-1 rounded">
                ⬅ Back
            </button>

            <h2 className="text-2xl font-bold">Request a Song</h2>

            {/* 🎵 Search for Songs */}
            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Search for a song..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="p-2 text-neutral-800 border rounded w-full"
                />
                <button onClick={handleSearch} className="bg-green-500 text-white px-4 py-2 rounded">
                    Search
                </button>
            </div>

            {/* 📌 Display Spotify Search Results */}
            {searchResults.length > 0 && (
                <ul className="mt-4 bg-gray-400 p-4 rounded h-[256px] flex flex-col overflow-y-auto">
                    <h3 className="text-white font-semibold">Select a Song to Request</h3>
                    {searchResults.map((song) => (
                        <li key={song.id} className="flex justify-between items-center p-2 border-b">
                            <div className="flex items-center gap-3">
                                {/* 🎵 Album Cover */}
                                <img 
                                    src={song.albumImage} 
                                    alt={song.name}
                                    className="w-12 h-12 object-cover rounded-md"
                                />
                                <p className="text-white">{song.name} - {song.artists[0]?.name}</p>
                            </div>
                            <button
                                onClick={() => handleRequest(song)}
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                Request
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* 📌 Requested Songs */}
            <h3 className="text-xl font-semibold mt-6">Song Requests</h3>
            <ul className="mt-4 flex flex-col overflow-y-auto bg-neutral-800 rounded-md h-[256px]">
                {requests.length > 0 ? (
                    requests.map((song) => (
                        <li key={song.id} className="flex justify-between items-center p-2 border-b">
                            <div className="flex items-center gap-3">
                                {/* 🎵 Album Cover */}
                                <img 
                                    src={song.imageUrl}  // ✅ Fix: Use imageUrl from Firestore
                                    alt={song.title}
                                    className="w-12 h-12 object-cover rounded-md"
                                />
                                <div>
                                    <p className="font-bold">{song.title} - {song.artist}</p>
                                    <p className="text-sm text-gray-600">Requested by {song.requestedByName}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {/* 👍 Upvote Button */}
                                <button onClick={() => handleUpvote(song.id, song.upvotes)} className="bg-gray-200 px-4 py-1 rounded">
                                    👍 {song.upvotes.length}
                                </button>

                                {/* 🗑️ Delete Button */}
                                {auth.currentUser?.uid === song.requestedBy && (
                                    <button onClick={() => handleDelete(song.id, song.requestedBy)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700">
                                        🗑️ Delete
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
    );
};

export default SongRequest;
