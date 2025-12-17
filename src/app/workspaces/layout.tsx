import { AuthProvider } from "@/Providers/AuthProvider";
import Navbar from "@/components/widgets/Navbar";
import { ToastContainer } from "react-toastify";
import WorkspaceSidebar from "@/components/features/workspace/WorkspaceSidebar";
import { WorkspaceProvider } from "@/Providers/WorkspaceProvider";
import { BoardProvider } from "@/Providers/BoardProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AuthProvider>
        <WorkspaceProvider>
          <BoardProvider>
            <div className="flex flex-col w-full h-screen">
              <Navbar />
              <main className="flex h-screen">
                <WorkspaceSidebar />
                <div className="flex-1 p-4">{children}</div>
              </main>
            </div>
          </BoardProvider>
        </WorkspaceProvider>{" "}
      </AuthProvider>
    </>
  );
}
