import { createContext, useContext, useState, ReactNode } from "react";

interface Song {
    id: string;
    title: string;
    artist?: string;
    album?: string;
    image?: string;
    audio: string;
    isNewRelease?: boolean; // Optional
}

interface MusicContextType {
    currentSong: Song | null;
    setCurrentSong: (song: Song | null) => void;
    isPlaying: boolean;
    setIsPlaying: (state: boolean) => void;
    queue: Song[];  // The queue should be an array of songs
    setQueue: (songs: Song[]) => void;  // Function to update the queue
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState<Song[]>([]);  // State to hold the queue of songs

    return (
        <MusicContext.Provider value={{ currentSong, setCurrentSong, isPlaying, setIsPlaying, queue, setQueue }}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error("useMusic must be used within a MusicProvider");
    }
    return context;
};
