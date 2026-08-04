import Link from "next/link";
import { Terminal, Code2, AtSign } from "lucide-react";

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
    <footer className="border-t border-border bg-bg-elevated">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-display text-base font-semibold">
              <Terminal size={16} className="text-signal" />
              PGDevLabs
            </Link>
            <p className="mt-3 text-sm text-fg-muted">
              A small studio shipping real apps.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="GitHub" className="text-fg-muted hover:text-fg">
                <Code2 size={16} />
              </a>
              <a href="#" aria-label="Twitter" className="text-fg-muted hover:text-fg">
                <AtSign size={16} />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono-tight text-[11px] uppercase tracking-wide text-fg-muted">
                {col.title}
              </h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-fg-muted hover:text-fg">
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
            build <span className="text-circuit">passing</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
