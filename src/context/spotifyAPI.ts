import { getSpotifyAccessToken } from "../context/SpotifyAuth";

// ✅ Define TypeScript interface for a Spotify track
interface SpotifyTrack {
    id: string;
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[] };
}

// ✅ Function to Search for Songs on Spotify
export const searchSpotifySongs = async (query: string): Promise<SpotifyTrack[]> => {
    const token = await getSpotifyAccessToken();
    if (!token) return [];

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();

        return data.tracks?.items.map((track: any) => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map((artist: any) => ({ name: artist.name })),
            album: track.album, // ✅ Keep the album object for images
        })) || [];

    } catch (error) {
        console.error("Error fetching Spotify songs:", error);
        return [];
    }
};
