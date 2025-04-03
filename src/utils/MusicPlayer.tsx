import { useMusic } from "../context/MusicContext";
import { albums } from "../assets/assets";
import { useEffect, useRef, useState } from "react";

const MusicPlayer = () => {

    const { currentSong, isPlaying, setIsPlaying, setCurrentSong } = useMusic();
    const audioRef = useRef(new Audio());
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    // Retrieve last played song from localStorage
    useEffect(() => {
        const savedData = localStorage.getItem("lastPlayedSong");
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setCurrentAlbumIndex(parsedData.albumIndex);
            setCurrentSongIndex(parsedData.songIndex);
            setCurrentSong(parsedData.song);
            setIsPlaying(parsedData.isPlaying);
        }
    }, []);

    // Save current song state to localStorage
    useEffect(() => {
        if (currentSong) {
            localStorage.setItem(
                "lastPlayedSong",
                JSON.stringify({
                    albumIndex: currentAlbumIndex,
                    songIndex: currentSongIndex,
                    song: currentSong,
                    isPlaying
                })
            );
        }
    }, [currentSong, currentAlbumIndex, currentSongIndex, isPlaying]);

    // Initialize audio when song changes
    useEffect(() => {
        if (!currentSong) return;

        audioRef.current.src = currentSong.audio;
        audioRef.current.load();

        audioRef.current.onloadedmetadata = () => setDuration(audioRef.current.duration);
        audioRef.current.ontimeupdate = () => {
            setCurrentTime(audioRef.current.currentTime);

            // ✅ Update Media Session positionState to sync seekbar
            if ("mediaSession" in navigator) {
                navigator.mediaSession.setPositionState({
                    duration: audioRef.current.duration || 0,
                    playbackRate: audioRef.current.playbackRate,
                    position: audioRef.current.currentTime
                });
            }
        };

        if (isPlaying) {
            audioRef.current.play().catch(err => console.error("Playback error:", err));
        }

        if (!currentSong) return;

        audioRef.current.src = currentSong.audio;
        audioRef.current.load();

        audioRef.current.onloadedmetadata = () => setDuration(audioRef.current.duration);
        audioRef.current.ontimeupdate = () => {
            setCurrentTime(audioRef.current.currentTime);

            // Update Media Session positionState
            if ("mediaSession" in navigator) {
                navigator.mediaSession.setPositionState({
                    duration: audioRef.current.duration || 0,
                    playbackRate: audioRef.current.playbackRate,
                    position: audioRef.current.currentTime
                });
            }
        };

        // 🔥 Chrome Bug Fix: Force Seekbar Update Every Second
        const chromeSeekbarFix = setInterval(() => {
            if ("mediaSession" in navigator && !audioRef.current.paused) {
                navigator.mediaSession.setPositionState({
                    duration: audioRef.current.duration || 0,
                    playbackRate: audioRef.current.playbackRate,
                    position: audioRef.current.currentTime
                });
            }
        }, 1000);

        // Make sure to only play when `isPlaying` is true
        if (isPlaying) {
            audioRef.current.play().catch(err => {
                console.error("Playback error:", err);
            });
        }

        // Update Media Session for notifications
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentSong.title,
                artist: currentSong.artist || "Unknown Artist",
                album: currentSong.album || "Unknown Album",
                artwork: [{ src: currentSong.image || "/default-cover.jpg", sizes: "512x512", type: "image/jpeg" }]
            });

            try {
                navigator.mediaSession.setActionHandler("play", () => {
                    if (audioRef.current.paused) {
                        // If the song is paused, resume it
                        audioRef.current.play().catch(err => {
                            console.error("Play failed:", err);
                        });
                        setIsPlaying(true); // Update play state
                    }
                });

                navigator.mediaSession.setActionHandler("pause", () => {
                    if (!audioRef.current.paused) {
                        // If the song is playing, pause it
                        audioRef.current.pause();
                        setIsPlaying(false); // Update pause state
                    }
                });

                navigator.mediaSession.setActionHandler("nexttrack", handleNext);
                navigator.mediaSession.setActionHandler("previoustrack", handlePrev);
                navigator.mediaSession.setActionHandler("seekto", (event) => {
                    if (event.seekTime !== undefined) {
                        audioRef.current.currentTime = event.seekTime;
                        setCurrentTime(event.seekTime);
                    }
                });

                navigator.mediaSession.setActionHandler("seekbackward", (event) => {
                    const seekOffset = event.seekOffset || 10;
                    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seekOffset);
                    setCurrentTime(audioRef.current.currentTime);
                });

                navigator.mediaSession.setActionHandler("seekforward", (event) => {
                    const seekOffset = event.seekOffset || 10;
                    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + seekOffset);
                    setCurrentTime(audioRef.current.currentTime);
                });

            } catch (error) {
                console.warn("Error in Media Session API:", error);
            }
        }

        return () => {
            // Cleanup event listeners & Chrome fix interval
            clearInterval(chromeSeekbarFix);
            audioRef.current.onloadedmetadata = null;
            audioRef.current.ontimeupdate = null;
        };
    }, [currentSong]);


    // Handle play/pause toggle
    const handlePlayPause = () => {
        if (!currentSong) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => console.error("Playback error:", err));
        }
        setIsPlaying(!isPlaying);
    };

    // Handle next song
    const handleNext = () => {
        if (!albums.length) return;

        let newSongIndex = currentSongIndex + 1;
        let newAlbumIndex = currentAlbumIndex;

        if (newSongIndex >= albums[newAlbumIndex].songs.length) {
            newAlbumIndex = (newAlbumIndex + 1) % albums.length;
            newSongIndex = 0;
        }

        const nextSong = albums[newAlbumIndex]?.songs[newSongIndex];
        if (nextSong) {
            setCurrentAlbumIndex(newAlbumIndex);
            setCurrentSongIndex(newSongIndex);
            setCurrentSong(nextSong);
            setIsPlaying(true);
        }
    };

    // Handle previous song
    const handlePrev = () => {
        if (!albums.length) return;

        let newSongIndex = currentSongIndex - 1;
        let newAlbumIndex = currentAlbumIndex;

        if (newSongIndex < 0) {
            newAlbumIndex = (newAlbumIndex - 1 + albums.length) % albums.length;
            newSongIndex = albums[newAlbumIndex].songs.length - 1;
        }

        const prevSong = albums[newAlbumIndex]?.songs[newSongIndex];
        if (prevSong) {
            setCurrentAlbumIndex(newAlbumIndex);
            setCurrentSongIndex(newSongIndex);
            setCurrentSong(prevSong);
            setIsPlaying(true);
        }
    };

    // Toggle Mute/Unmute
    const toggleMute = () => {
        setIsMuted(!isMuted);
        audioRef.current.muted = !isMuted;
    };

    // Handle seekbar click
    const handleSeekbarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const newTime = clickPosition * duration;

        audioRef.current.currentTime = newTime; // Update audioRef currentTime
        setCurrentTime(newTime); // Update the state as well
    };


    return (
        <>
            <div className="bg-transparent w-full h-20 px-4 md:px-1.5 fixed bottom-[2px] md:bottom-0">
                <div className="w-full h-16 md:h-20 bg-neutral-800/90 md:bg-neutral-950 flex justify-between items-center px-2 py-1 rounded-md md:rounded-none">

                    {/* Hidden Audio Element */}
                    <audio ref={audioRef} onEnded={handleNext} controls hidden />

                    {/* Album Cover and Metadata */}
                    <div className="w-[60%] sm:w-[30%] h-20 flex items-center px-2 md:px-4 cursor-pointer">

                        {/* Album Cover */}
                        <div className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-md overflow-hidden flex-shrink-0">
                            <img
                                className="w-full h-full object-cover object-center"
                                src={currentSong?.image || "https://images.template.net/90836/spotify-album-cover-template-m19i3.jpeg"}
                                alt="Album Cover"
                            />
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-col justify-center pl-3 w-full overflow-hidden">

                            {/* Song Title with Marquee */}
                            <div className="relative w-[90%] sm:w-[80%] lg:w-[60%] overflow-hidden">
                                {currentSong?.title && currentSong.title.length > 15 ? (
                                    <div className="whitespace-nowrap flex animate-marquee-container">
                                        <h2 className="text-[12px] max-xs:text-[10px] text-white font-semibold whitespace-nowrap inline-block animate-marquee">
                                            {currentSong?.title} &nbsp; • &nbsp;
                                        </h2>
                                        <h2 className="text-[12px] max-xs:text-[10px] text-white font-semibold whitespace-nowrap inline-block animate-marquee">
                                            {currentSong?.title} &nbsp; • &nbsp;
                                        </h2>
                                    </div>
                                ) : (
                                    <h2 className="text-[12px] max-xs:text-[10px] text-white font-semibold truncate">
                                        {currentSong?.title || "Hit Play"}
                                    </h2>
                                )}
                            </div>

                            {/* Artist Name (No Marquee) */}
                            <div className="relative w-[90%] sm:w-[80%] overflow-hidden">
                                <h2 className="text-[10px] max-sm:text-[9px] text-gray-300 font-medium mt-0.5 max-sm:mt-0 truncate">
                                    {currentSong?.artist || "Set the Mood"}
                                </h2>
                            </div>
                        </div>

                    </div>

                    {/* Player Controls  */}
                    <div className="w-[40%] sm:w-[40%] h-20 px-1 py-2 bg-ellow-400 flex flex-col justify-center sm:justify-self-auto items-center">
                        <div className="flex gap-6">
                            <button onClick={handlePrev}>
                                <img className="w-4" src="/assets/player ico/backward-ico.svg" alt="" />
                            </button>
                            <button onClick={handlePlayPause}>
                                {isPlaying ? (
                                    <img className="w-8" src="/assets/player ico/pause-ico.svg" alt="Pause" />
                                ) : (
                                    <img className="w-8" src="/assets/player ico/play-ico.svg" alt="Play" />
                                )}
                            </button>
                            <button onClick={handleNext}>
                                <img className="w-4" src="/assets/player ico/forward-ico.svg" alt="" />
                            </button>
                        </div>

                        {/* Seekbar  */}
                        <div className="hidden sm:flex items-center w-full gap-4 mt-2 mb-1 relative group justify-center">
                            <h2 className="text-xs text-white font-semibold min-w-[40px] text-right">
                                {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")}
                            </h2>

                            {/* Seekbar Container */}
                            <div
                                className="relative flex-1 h-1 bg-neutral-600 rounded-full cursor-pointer"
                                onClick={handleSeekbarClick}
                            >
                                {/* Seekbar Progress */}
                                <div
                                    className="absolute top-0 left-0 h-full bg-[#1ed75f] rounded-full transition-all duration-100"
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                />

                                {/* Seekbar Circle (Visible on Hover & Moves with Progress) */}
                                <div
                                    className="absolute top-[-4px] transform -translate-x-1/2 w-3 h-3 bg-white rounded-full transition-all duration-100 opacity-100"
                                    style={{ left: `${(currentTime / duration) * 100}%` }}
                                />
                            </div>

                            <h2 className="text-xs text-white font-semibold min-w-[40px] text-left">
                                {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}
                            </h2>
                        </div>
                    </div>
                    {/* Player Controls ends  */}

                    {/* Extra options  */}
                    <div className="w-[30%] h-20 p-1 bg-merald-400 hidden sm:flex justify-evenly">
                        <div className="flex justify-end items-center gap-4">
                            <img className="w-[18px]" src="/assets/player ico/share-ico.svg" alt="" />

                            {/* Speaker Icon */}
                            <div className="flex items-center gap-3">
                                <button onClick={toggleMute} className="focus:outline-none">
                                    <img
                                        className="w-4 cursor-pointer"
                                        src={isMuted || volume === 0 ? "/assets/player ico/mute-ico.svg" : "/assets/player ico/speaker-ico.svg"}
                                        alt="Volume Control"
                                    />
                                </button>

                                {/* Volume Bar */}
                                <div
                                    className="relative w-20 h-1 bg-neutral-600 rounded-full cursor-pointer"
                                    onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const clickPosition = (e.clientX - rect.left) / rect.width;
                                        const newVolume = Math.max(0, Math.min(1, clickPosition));
                                        setVolume(newVolume);
                                        audioRef.current.volume = newVolume;
                                        setIsMuted(newVolume === 0);
                                    }}
                                >
                                    {/* Volume Level */}
                                    <div
                                        className="absolute top-0 left-0 h-full bg-[#1ed75f] rounded-full transition-all duration-100"
                                        style={{ width: `${volume * 100}%` }}
                                    />

                                    {/* Volume Circle (Moves with Volume Level) */}
                                    <div
                                        className="absolute top-[-4px] transform -translate-x-1/2 w-3 h-3 bg-white rounded-full transition-all duration-100 opacity-100"
                                        style={{ left: `${volume * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MusicPlayer
