import Navbar from "@/components/ui/Navbar";
import AuthGuard from "@/guards/AuthGuard";

export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard>
      <div className="flex flex-col w-full min-h-screen bg-slate-950 text-white">
        <Navbar />
        <main className="flex-1">
          <div className="relative py-8">
            <div className="absolute inset-0 w-full h-full bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[32px_32px]" />
            <div className="container relative z-10 mx-auto px-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
