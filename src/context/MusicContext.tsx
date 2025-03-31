import { createContext, useContext, useState, ReactNode } from "react";

interface Song {
    id: string;
    title: string;
    artist?: string;
    album?: string;
    image?: string;
    audio: string;
}

interface MusicContextType {
    currentSong: Song | null;
    setCurrentSong: (song: Song | null) => void;
    isPlaying: boolean;
    setIsPlaying: (state: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <MusicContext.Provider value={{ currentSong, setCurrentSong, isPlaying, setIsPlaying }}>
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
