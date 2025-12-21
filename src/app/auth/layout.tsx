import PublicNavbar from "@/components/ui/PublicNavbar";


export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <PublicNavbar />
            <main>{children}</main>
        </div>
    );
}
