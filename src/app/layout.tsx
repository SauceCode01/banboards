import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/Providers/AuthProvider"; 
import { ToastContainer } from "react-toastify"; 
import { WorkspaceProvider } from "@/Providers/WorkspaceProvider";
import { BoardProvider } from "@/Providers/BoardProvider";
import { QueryProvider } from "@/Providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    template: "%s | BanBoards",
    default: "BanBoards - Kanban Project Management",
  },
  description:
    "Streamline your workflow with BanBoards. The ultimate open-source tool for agile teams to track tasks and manage projects efficiently.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BanBoards",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "BanBoards Kanban Board",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BanBoards - Open Source Kanban Project Management",
    description:
      "Streamline your workflow with BanBoards. The ultimate open-source tool for agile teams to track tasks and manage projects efficiently.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <BoardProvider>{children}</BoardProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </QueryProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
