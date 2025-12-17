import AuthGuard from "@/guards/AuthGuard";
import Navbar from "@/components/widgets/Navbar";
import WorkspaceSidebar from "@/components/features/workspace/WorkspaceSidebar";

export default function WorkspacesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="flex flex-col w-full h-screen bg-slate-950 text-white">
        <Navbar />
        <main className="flex h-full">
          <WorkspaceSidebar />
          <div className="flex-1 p-4 h-full overflow-y-auto">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}