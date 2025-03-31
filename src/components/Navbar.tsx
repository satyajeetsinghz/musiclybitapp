import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { ChevronDown } from "lucide-react";

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user, signInWithGoogle, logout } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ✅ Close dropdown when user logs in
    useEffect(() => {
        setDropdownOpen(false);
    }, [user]);

    // ✅ Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex justify-between items-center w-full h-14 fixed top-0 bg-neutral-950 text-white px-4 z-50 shadow-md">
            {/* Logo */}
            <div>
                {/* <img className="w-52" src="/assets/logo/musiclybit_logo.png" alt="" /> */}
                <img className="w-32 hidden md:block" src="assets/logo/musicly-text-white-logo.svg" alt="" />
                <img className="w-16 md:hidden" src="/assets/logo/mb-text-white-logo.svg" alt="" />
            </div>

            {/* Login Button (Shown if user is not logged in) */}
            {!user && (
                <div className="hidden xl:flex justify-center gap-3">
                    <button
                        onClick={signInWithGoogle}
                        className="text-[14px] text-white hover:text-black hover:bg-white uppercase font-bold w-24 py-1.5 bg-transparent border border-white transition rounded-full">
                        Log In
                    </button>
                </div>
            )}

            {/* User Profile & Dropdown */}
            {user ? (
                <div ref={dropdownRef} className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 rounded-md transition"
                    >
                        <img
                            className="w-8 h-8 rounded-full border border-gray-400"
                            src={user.photoURL || "/assets/default-profile.png"}
                            alt="User Profile"
                        />
                        <h3 className="text-sm hidden md:block font-semibold">{user.displayName || "User"}</h3>
                        <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? "rotate-180" : "rotate-0"}`} />
                    </button>

                    {/* Dropdown Menu with Smooth Animation */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-36 bg-neutral-950 backdrop-blur-md border border-neutral-800 rounded-lg shadow-lg animate-fadeIn">
                            <button
                                onClick={() => console.log("Go to Profile")}
                                className="block w-full px-4 py-2 text-sm text-white font-medium hover:bg-neutral-900 rounded-t-md transition">
                                Profile
                            </button>
                            {/* <button
                                onClick={() => console.log("Open Settings")}
                                className="block w-full px-4 py-2 text-xs text-white hover:text-green-400 font-medium hover:bg-neutral-900 uppercase transition">
                                Settings
                            </button>
                            <button
                                onClick={() => console.log("View Your Playlist")}
                                className="block w-full px-4 py-2 text-xs text-white hover:text-green-400 font-medium hover:bg-neutral-900 uppercase transition">
                                Playlists
                            </button> */}
                            <div className="border-t border-neutral-800"></div> {/* Divider */}
                            <button
                                onClick={logout}
                                className="block w-full px-4 py-2 text-sm text-white hover:bg-neutral-900 font-semibold rounded-b-md transition">
                                Log out
                            </button>
                        </div>
                    )}

                </div>
            ) : (
                <button
                    onClick={signInWithGoogle}
                    className="xl:hidden text-[12px] text-white hover:text-black hover:bg-white uppercase font-bold w-20 py-1 bg-transparent border border-white transition">
                    Sign In
                </button>
            )}
        </div>
    );
};

export default Navbar;
