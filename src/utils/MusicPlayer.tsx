import { useMusic } from "../context/MusicContext";
import { albums } from "../assets/assets";
import { useEffect, useRef, useState } from "react";

const MusicPlayer = () => {

    const { currentSong, isPlaying, setIsPlaying, setCurrentSong } = useMusic();
    const audioRef = useRef(new Audio());
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    // Load and Play Selected Song
    useEffect(() => {
        if (currentSong) {
            audioRef.current.pause();
            audioRef.current.src = currentSong.audio;
            audioRef.current.load();

            audioRef.current.onloadedmetadata = () => {
                setDuration(audioRef.current.duration);
            };

            audioRef.current.ontimeupdate = () => {
                setCurrentTime(audioRef.current.currentTime);
            };

            if (isPlaying) {
                audioRef.current.play().catch((err) => console.error("Playback error:", err));
            }

            // Check if Media Session API is available
            if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: currentSong?.title || "Unknown Title",
                    artist: currentSong?.artist || "Unknown Artist",
                    album: currentSong?.album || "Unknown Album",  // ✅ Fix: Provide default value
                    artwork: [
                        {
                            src: currentSong?.image || "https://example.com/default-album.png",  // ✅ Fix: Provide default album cover
                            sizes: "512x512",
                            type: "image/png"
                        }
                    ]
                });
            }

        }
    }, [currentSong]);

    // Play/Pause functionality
    const handlePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // ✅ Seekbar functionality (Properly Used)
    // const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const newTime = parseFloat(e.target.value);
    //     audioRef.current.currentTime = newTime;
    //     setCurrentTime(newTime);
    // };

    // ✅ Next Song (Select First Song from Next Album)
    const handleNext = () => {
        const newIndex = (currentIndex + 1) % albums.length;
        setCurrentIndex(newIndex);

        // Pick the first song from the next album
        const nextSong = albums[newIndex].songs[0];
        if (nextSong) {
            setCurrentSong(nextSong);
            setIsPlaying(true);
        }
    };

    // ✅ Previous Song (Select First Song from Previous Album)
    const handlePrev = () => {
        const newIndex = (currentIndex - 1 + albums.length) % albums.length;
        setCurrentIndex(newIndex);

        // Pick the first song from the previous album
        const prevSong = albums[newIndex].songs[0];
        if (prevSong) {
            setCurrentSong(prevSong);
            setIsPlaying(true);
        }
    };

    // ✅ Volume Control (Properly Used)
    // const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const newVolume = parseFloat(e.target.value);
    //     setVolume(newVolume);
    //     audioRef.current.volume = newVolume;
    //     setIsMuted(newVolume === 0);
    // };

    // Toggle Mute/Unmute
    const toggleMute = () => {
        setIsMuted(!isMuted);
        audioRef.current.muted = !isMuted;
    };

    const handleSongEnd = () => {
        setIsPlaying(false); // Set to play state when the song ends
    };


    return (
        <>
            <div className="bg-transparent w-full h-20 px-4 md:px-1.5 fixed bottom-[2px] md:bottom-0">
                <div className="w-full h-16 md:h-20 bg-neutral-800/90 md:bg-neutral-950 flex justify-between items-center px-2 py-1 rounded-md md:rounded-none">

                    {/* Hidden Audio Element */}
                    <audio ref={audioRef} onEnded={handleSongEnd} controls hidden />

                    {/* Album Cover and Metadata  */}
                    <div className="w-[60%] sm:w-[30%] h-20 py-[8px] px-[2px] md:px-[8px] bg-ed-300 flex cursor-pointer">
                        <div className="w-[60px] h-[60px] max-xs:w-[50px] max-xs:h-[50px] max-xs:mt-[6px] rounded-md overflow-hidden">
                            <img className="w-full h-full object-cover object-center" src={currentSong?.image || "https://images.template.net/90836/spotify-album-cover-template-m19i3.jpeg"} alt="" />
                        </div>

                        <div className="flex flex-col justify-center pl-3">
                            <h2 className="text-[12px] max-xs:text-[10px] text-white font-semibold">{currentSong?.title || "Hit Play"}</h2>
                            <h2 className="text-[10px] max-sm:text-[9px] text-white font-medium mt-0.5 max-sm:mt-0">{currentSong?.artist || "Set the Mood"}</h2>
                        </div>
                    </div>
                    {/* Album Cover and Metadata ends  */}

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
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const clickPosition = (e.clientX - rect.left) / rect.width;
                                    const newTime = clickPosition * duration;
                                    audioRef.current.currentTime = newTime;
                                    setCurrentTime(newTime);
                                }}
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
