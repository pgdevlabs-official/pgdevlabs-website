"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Terminal, MoreVertical, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/apps", label: "Apps" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/team", label: "Team" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <Terminal size={18} className="text-signal" />
          PGDevLabs
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-fg"
                  : "text-fg-muted hover:text-fg"
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
            className="hidden rounded-md bg-signal px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110 sm:inline-flex"
          >
            Browse Apps
          </Link>

          <div className="relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              aria-label="More options"
              className="flex h-8 w-8 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-bg-elevated hover:text-fg"
            >
              <MoreVertical size={18} />
            </button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-md border border-border bg-bg-elevated py-1 shadow-xl">
                  <Link
                    href="/admin"
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm font-medium text-fg hover:bg-bg"
                  >
                    <ShieldCheck size={14} /> Admin panel
                  </Link>
                  <Link
                    href="/admin?tab=apps&new=1"
                    onClick={() => setMoreOpen(false)}
                    className="block px-3 py-2 text-sm text-fg-muted hover:bg-bg hover:text-fg"
                  >
                    + Add app
                  </Link>
                  <Link
                    href="/admin?tab=projects&new=1"
                    onClick={() => setMoreOpen(false)}
                    className="block px-3 py-2 text-sm text-fg-muted hover:bg-bg hover:text-fg"
                  >
                    + Add project
                  </Link>
                  <Link
                    href="/admin?tab=blog&new=1"
                    onClick={() => setMoreOpen(false)}
                    className="block px-3 py-2 text-sm text-fg-muted hover:bg-bg hover:text-fg"
                  >
                    + Add blog post
                  </Link>
                  <Link
                    href="/admin?tab=team&new=1"
                    onClick={() => setMoreOpen(false)}
                    className="block px-3 py-2 text-sm text-fg-muted hover:bg-bg hover:text-fg"
                  >
                    + Add team member
                  </Link>
                </div>
              </>
            )}
          </div>

          <button
            className="text-fg-muted md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <div className="mb-3">
            <CommandPalette />
          </div>
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-fg-muted hover:bg-bg-elevated hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-fg-muted hover:bg-bg-elevated hover:text-fg"
            >
              <ShieldCheck size={14} /> Admin panel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
