"use client";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { auth } from "@/lib/firebase";

export default function Navbar() {
    const { user, googleSignIn, logOut } = useAuth();

    const handleAuth = async () => {
        if (user) {
            await logOut();
        } else {
            console.log({
                origin: window.location.origin,
                projectId: auth.app.options.projectId,
                authDomain: auth.app.options.authDomain,
            });
            await googleSignIn();
        }
    };

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100">
            <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                <Link href="/">Raj's Library</Link>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-6 text-slate-600 font-medium text-sm">
                    <Link href="/" className="hover:text-blue-600 transition-colors">
                        Collections
                    </Link>
                </div>

                {user && (
                    <div className="flex items-center gap-3">
                        {user.photoURL && <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full border border-gray-200" />}
                        <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.displayName}</span>
                    </div>
                )}

                <button
                    onClick={handleAuth}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-md"
                >
                    {user ? "Sign Out" : "Sign In"}
                </button>
            </div>
        </nav>
    );
}
