import AuthGuard from "@/components/auth/auth-guard"
import Nav from "@/components/nav"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-svh flex-col bg-muted">
        <Nav />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  )
}
