"use client";

import PublicNavbar from "@/components/widgets/PublicNavbar";
import { motion } from "framer-motion";
import { Users, LayoutDashboard, ListTodo, ArrowRight } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { cn } from "@/lib/utils";
 

const KanbanVisual = () => {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const columns = [
        [ {h: 'h-10'}, {h: 'h-16'}, {h: 'h-12'} ],
        [ {h: 'h-12'}, {h: 'h-10'} ],
        [ {h: 'h-16'} ],
    ]

    return (
        <motion.div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 shadow-2xl shadow-indigo-500/10"
        >
            <div className="absolute top-2 left-4 text-xs text-slate-500 font-mono select-none">
                // banboards-ui
            </div>
            <motion.div
                className="h-full w-full p-2 md:p-4 flex gap-2 md:gap-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.8 }}
            >
                {columns.map((cards, i) => (
                    <div key={i} className="w-1/3 bg-slate-800/50 rounded-lg p-2 flex flex-col gap-2">
                        {cards.map((card, j) => (
                             <motion.div
                                key={j}
                                className={cn("bg-slate-700/50 rounded", card.h)}
                                variants={cardVariants}
                             ></motion.div>
                        ))}
                    </div>
                ))}
            </motion.div>
        </motion.div>
    )
}

const HeroSection = () => {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center pt-32 pb-12 text-center overflow-hidden bg-slate-950"
    >
      <div className="absolute inset-0 w-full h-full bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px]"></div>
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-950/50 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-950/50 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tighter mb-6">
            Organize chaos.
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              Build together.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10">
            A collaborative workspace to bring your team's projects to life. Create workspaces, manage boards, and track progress in real-time.
          </p>
          <div className="flex justify-center gap-4">
             <motion.a
                href="/workspaces"
                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px -5px rgba(99, 102, 241, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Create Workspace
            </motion.a>
            <motion.a
              href="#features"
              className="px-8 py-4 bg-slate-800/50 border border-slate-700 text-slate-300 font-semibold rounded-xl"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(30, 41, 59, 0.8)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Learn More
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          className="relative mt-20 lg:mt-24 w-full max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 1, 
            delay: 0.3, 
            ease: [0, 0.71, 0.2, 1.01],
            scale: { type: "spring", stiffness: 300, damping: 15 }
          }}
          whileHover={{ scale: 1.03 }}
        >
          <motion.div
            className="relative aspect-[16/9] w-full"
            style={{ transform: "rotateX(45deg) rotateZ(-15deg) scale(0.9)" }}
            animate={{ y: [0, -12, 0] }}
            transition={{
                repeat: Infinity,
                duration: 7,
                ease: "easeInOut",
            }}
          >
            <KanbanVisual />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

type FeatureCardProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
};

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => {
  const Icon = icon;
  return (
    <motion.div
      className="bg-slate-900/70 backdrop-blur-sm p-8 rounded-2xl border border-slate-800"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.03, borderColor: "rgba(99, 102, 241, 0.5)" }}
      transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="mb-6 w-12 h-12 bg-indigo-600/10 border border-indigo-600/30 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-indigo-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: LayoutDashboard,
      title: "Flexible Structure",
      description: "Organize everything in Workspaces and Boards. Create a dedicated space for every project, team, or client.",
    },
    {
      icon: ListTodo,
      title: "Dynamic Workflow",
      description: "Use customizable Lists and Items to build the perfect Kanban workflow. Drag, drop, and get things done.",
    },
    {
      icon: Users,
      title: "Real-time Teamwork",
      description: "Invite collaborators to your workspaces and see changes happen live. Keep everyone in sync, effortlessly.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 bg-slate-950">
      <div className="container mx-auto px-6">
        <motion.div
         initial={{ opacity: 0, y: 20 }}
         whileInView={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, ease: "easeOut" }}
         viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
            Powerful, yet simple.
          </h2>
          <p className="max-w-2xl mx-auto text-center text-slate-400 text-lg mb-16">
            Everything you need to move work forward, without the clutter.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const CtaSection = () => {
    return (
        <section className="py-20 bg-slate-950">
            <div className="container mx-auto px-6 text-center">
                <motion.div
                    className="bg-gradient-to-br from-slate-900 to-slate-900/70 border border-slate-800 rounded-2xl p-10 md:p-16 max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Boost Your Productivity?</h2>
                    <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                        Stop juggling tools. Start building momentum with Banboards today.
                    </p>
                    <motion.a
                        href="/auth/register"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg"
                        whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px -5px rgba(99, 102, 241, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        Get Started for Free <ArrowRight className="w-5 h-5" />
                    </motion.a>
                </motion.div>
            </div>
        </section>
    )
}

const Footer = () => {
    return (
        <footer className="bg-slate-950 border-t border-slate-800/50 py-8">
            <div className="container mx-auto px-6 text-center text-slate-500">
                <p>&copy; {new Date().getFullYear()} Banboards. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default function LandingPage() {
  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <PublicNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}