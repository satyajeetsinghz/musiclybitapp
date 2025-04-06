import { X } from "lucide-react";
import { useState } from "react";

const BannerAd = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="relative w-full max-w-[500px] sm:max-w-[600px] md:max-w-[700px] lg:max-w-full bg-gradient-to-r from-pink-500 to-pink-300 text-white px-4 py-1 shadow-lg animate-puls overflow-hidden mb-4 mx-auto">
            {/* Close Button */}
            <button
                className="absolute top-0 sm:top-2 right-0 sm:right-2 text-white hover:text-black transition"
                onClick={() => setIsVisible(false)}
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
                    <h2 className="text-xs sm:text-base font-bold truncate max-w-[60%] sm:max-w-[100%]">
                        New Release: "Azizam"
                    </h2>
                    <p className="text-xs sm:text-sm font-medium truncate max-w-[60%] sm:max-w-[100%]">
                        by Ed Sheeran — listen now!
                    </p>
                </div>

            </div>
        </div>

    );
};

export default BannerAd;
