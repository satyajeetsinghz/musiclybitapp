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
        <div className="flex justify-between items-center w-full h-14 fixed top-0 bg-neutral-950 text-white px-4">
            {/* Logo */}
            <div className="z-50">
                <h2 className="text-xl text-green-400 font-extrabold cursor-pointer -tracking-tighter">MB</h2>
            </div>

            {/* Buttons section - Only show if user is not logged in */}
            {!user && (
                <div className="hidden xl:flex justify-center gap-3">
                    <button 
                        onClick={signInWithGoogle} 
                        className="text-[14px] text-center text-white hover:text-black hover:bg-white uppercase font-bold w-24 py-1.5 bg-transparent border-[1px] border-white">
                        Log In
                    </button>
                </div>
            )}

            {/* User Profile Section */}
            {user ? (
                <div ref={dropdownRef} className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 cursor-pointer">
                        <img
                            className="w-8 h-8 rounded-full border border-gray-400"
                            src={user.photoURL || "/assets/default-profile.png"}
                            alt="User Profile"
                        />
                        <h3 className="text-sm hidden md:block font-semibold">{user.displayName || "User"}</h3>
                        <ChevronDown size={16} />
                    </button>
                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-24 bg-neutral-950 border border-white shadow-lg">
                            <button 
                                onClick={logout} 
                                className="block w-full px-4 py-2 text-xs text-white hover:bg-neutral-900 uppercase">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button 
                    onClick={signInWithGoogle} 
                    className="xl:hidden text-[12px] text-center text-white hover:text-black hover:bg-white uppercase font-bold w-20 py-1 bg-transparent border-[1px] border-white">
                    Sign In
                </button>
            )}
        </div>
    );
};

export default Navbar;
