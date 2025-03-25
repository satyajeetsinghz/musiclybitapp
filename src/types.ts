export interface Song {
    id: string;
    title: string;
    artist: string;
    image?: string;
    audio: string;
    dateAdded?: string;
}

export interface Album {
    id: string;
    name: string;
    artist: string;
    image: string;
    cover?: string;
    aboutCover?: string;
    songs?: Song[];  // ✅ Use Song type instead of any[]
}
