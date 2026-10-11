"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Terminal, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/apps", label: "Apps" },
  { href: "/marketplace", label: "Sell / Seller" },
  { href: "/projects", label: "Development" },
  { href: "/blog", label: "Blog" },
  { href: "/downloads", label: "Useful Resources" },
  { href: "/team", label: "Team" },
  { href: "/contact", label: "Help" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/75 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-signal to-violet text-white shadow-lg shadow-signal/20">
            <Terminal size={16} />
          </span>
          PGDevLabs
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition-all duration-200",
                pathname === link.href
                  ? "bg-white/5 text-fg shadow-inner shadow-white/5"
                  : "text-fg-muted hover:bg-white/5 hover:text-fg"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <CommandPalette />
          </div>
          <ThemeToggle />
          <Link
            href="/apps"
            className="hidden rounded-full bg-gradient-to-r from-signal to-violet px-4 py-2 text-sm font-medium text-white shadow-lg shadow-signal/20 transition-all hover:brightness-110 sm:inline-flex"
          >
            View my work
          </Link>
          <button
            className="rounded-full border border-border bg-white/5 p-2 text-fg-muted md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-bg/80 px-4 py-3 md:hidden backdrop-blur-xl">
          <div className="mb-3">
            <CommandPalette />
          </div>
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-fg-muted hover:bg-white/5 hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}