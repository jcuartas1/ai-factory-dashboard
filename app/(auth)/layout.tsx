export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Decorative golden glow — Luxury touch */}
      <div
        aria-hidden="true"
        className="absolute w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none"
      />
      <div className="relative z-10">{children}</div>
    </main>
  )
}
