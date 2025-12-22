import Navbar from "@/components/ui/Navbar";
import AuthGuard from "@/guards/AuthGuard"; 

export default function WorkspacesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="flex flex-col w-full h-screen  bg-slate-950 text-white">
        <Navbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}