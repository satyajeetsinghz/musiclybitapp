const CLIENT_ID = "80d58c65e7184a36a7f03b0abab3cc17"; // 🔹 Replace with your Client ID
const CLIENT_SECRET = "8d4e14c65e0f4d57b2f1c3c1eecd4ecc"; // 🔹 Replace with your Client Secret
const TOKEN_URL = "https://accounts.spotify.com/api/token";

// ✅ Fetch Spotify Access Token
export const getSpotifyAccessToken = async () => {
    try {
        const response = await fetch(TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`, // 🔹 Encode credentials
            },
            body: "grant_type=client_credentials", // 🔹 Required for non-user token
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch token");

        return data.access_token; // 🔥 Return the token for API requests
    } catch (error) {
        console.error("Error fetching Spotify Access Token:", error);
        return null;
    }
};
