import WorkspaceSidebar from "@/components/workspaces/WorkspaceSidebar";
import AuthGuard from "@/guards/AuthGuard"; 

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
