import { X } from "lucide-react";
import { useState } from "react";

interface BannerAdProps {
    onClick: () => void;
}

const BannerAd: React.FC<BannerAdProps> = ({ onClick }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div
            className="relative w-full max-w-[500px] sm:max-w-[600px] md:max-w-[700px] lg:max-w-full bg-gradient-to-r from-[#ed5c8e] to-[#ff90b9] text-white px-4 py-1 shadow-lg animate-puls overflow-hidden mb-4 mx-auto cursor-pointer"
            onClick={onClick}
        >
            {/* Close Button */}
            <button
                className="absolute top-1 sm:top-2 right-1 sm:right-2 text-white hover:text-black transition z-10"
                onClick={(e) => {
                    e.stopPropagation(); // prevent playing the song when closing
                    setIsVisible(false);
                }}
            >
                <X className="w-4 h-4 lg:w-6 lg:h-6" />
            </button>

            {/* Content */}
            <div className="flex items-center sm:justify-center gap-3">
                <img
                    src="assets/musics/album_cover/Cover of Azizam by Ed Sheeran.jpg"
                    alt="Azizam"
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-md shadow-lg object-cover"
                />
                <div className="flex items-center sm:gap-2 overflow-hidden">
                    <h2 className="text-xs sm:text-base font-bold truncate max-w-min sm:max-w-[100%]">
                        New: Azizam by Ed Sheeran Listen now!
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default BannerAd;
