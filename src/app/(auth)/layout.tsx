import Link from "next/link";
import { FiFilm } from "react-icons/fi";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl w-fit">
          <FiFilm className="text-primary w-5 h-5" />
          <span className="text-gradient">CinePortal</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">{children}</main>
      <footer className="p-6 text-center text-sm text-muted-foreground">
        © 2026 CinePortal. All rights reserved.
      </footer>
    </div>
  );
}
