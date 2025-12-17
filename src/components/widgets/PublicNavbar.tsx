"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuthContext } from "@/Providers/AuthProvider";
import { ArrowRight, Loader2 } from "lucide-react";

const PublicNavbar = () => {
    const { authState, session, userProfile } = useAuthContext();

    const renderAuthContent = () => {
        switch (authState) {
            case 'initiating':
                return <Loader2 className="w-5 h-5 animate-spin text-slate-400" />;
            
            case 'authenticated':
                return (
                    <>
                        <span className="text-slate-300 text-sm hidden sm:block">
                            Welcome, {userProfile?.username || session?.user.email}
                        </span>
                        <motion.a
                            href="/workspaces"
                            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/20"
                            whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px -5px rgba(99, 102, 241, 0.5)" }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            Go to App <ArrowRight className="w-4 h-4" />
                        </motion.a>
                    </>
                );

            case 'unauthenticated':
                return (
                    <>
                        <motion.a
                            href="/auth/login"
                            className="text-slate-300 hover:text-white transition-colors duration-300 px-4 py-2 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Login
                        </motion.a>
                        <motion.a
                            href="/auth/register"
                            className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/20"
                            whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px -5px rgba(99, 102, 241, 0.5)" }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            Get Started
                        </motion.a>
                    </>
                );
            
            default:
                return null;
        }
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 backdrop-blur-xl bg-slate-950/50 border-b border-slate-800/50">
            <div className="container mx-auto flex justify-between items-center">
                <motion.div whileHover={{ scale: 1.05 }}>
                    <Link href="/" className="text-2xl font-bold text-white tracking-wider cursor-pointer">
                        Banboards
                    </Link>
                </motion.div>
                
                <div className="flex items-center gap-2 md:gap-4 h-9">
                    {renderAuthContent()}
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
