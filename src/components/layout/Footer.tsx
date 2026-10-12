import Link from "next/link";
import { Code2, Terminal } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/apps", label: "Apps" },
      { href: "/projects", label: "Projects" },
      { href: "/downloads", label: "Downloads" },
    ],
  },
  {
    title: "Studio",
    links: [
      { href: "/about", label: "About" },
      { href: "/team", label: "Team" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-black/10">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-display text-base font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-signal to-violet text-white">
                <Terminal size={15} />
              </span>
              PGDevLabs
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-fg-muted">
              A small studio shipping sharp products that feel premium, useful, and worth keeping.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="https://github.com/pgdevlabs-official/pgdevlabs-website" target="_blank" rel="noreferrer" aria-label="PGDevLabs on GitHub" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/5 text-fg-muted transition-colors hover:text-fg">
                <Code2 size={15} />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono-tight text-[11px] uppercase tracking-[0.14em] text-fg-muted">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-fg-muted transition-colors hover:text-fg">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 sm:flex-row">
          <p className="font-mono-tight text-xs text-fg-muted">
            © {new Date().getFullYear()} PGDevLabs. All rights reserved.
          </p>
          <p className="font-mono-tight text-xs text-fg-muted">
            build <span className="text-circuit">smarter</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
