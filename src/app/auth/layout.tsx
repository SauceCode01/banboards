import PublicNavbar from "@/components/widgets/PublicNavbar";

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
