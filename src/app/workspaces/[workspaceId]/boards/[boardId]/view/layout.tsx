import AuthGuard from "@/guards/AuthGuard";
import Navbar from "@/components/widgets/Navbar";
import WorkspaceSidebar from "@/components/features/workspace/WorkspaceSidebar";

export default function WorkspacesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <>{children}</>
    <main className="flex h-full">
      <WorkspaceSidebar />
      <div className="flex-1 h-full overflow-auto">{children}</div>
    </main>
  );
}
