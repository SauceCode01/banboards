"use client";

import { useAuthContext } from "@/Providers/AuthProvider";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, User as UserIcon, Settings } from "lucide-react";

const Navbar = () => {
  const { session, userProfile } = useAuthContext();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-slate-950/70 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-40">
      <div className="container mx-auto px-6 h-16 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500"
        >
          BanBoards
        </Link>

        <div className="flex items-center gap-6">
          {session ? (
            <>
              <Link
                href="/workspaces"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Workspaces
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20 p-1"
                    >
                      <div className="p-2 border-b border-slate-700">
                        <p className="text-sm font-medium text-white truncate">
                          {userProfile?.username || "User"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {userProfile?.email}
                        </p>
                      </div>
                      <ul className="py-1">
                        <li>
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-md"
                          >
                            <UserIcon className="w-4 h-4" />
                            Profile
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/settings"
                            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-md"
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                        </li>
                        <li className="my-1 h-px bg-slate-700" />
                        <li>
                          <Link
                            href="/auth/logout"
                            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </Link>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
