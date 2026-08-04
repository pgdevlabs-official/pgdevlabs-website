"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import type { AppVersion } from "@/types";

export function VersionHistory({ versions }: { versions: AppVersion[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {versions.map((v, i) => (
        <div key={v.version}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono-tight text-sm font-medium text-signal">
                v{v.version}
              </span>
              <span className="font-mono-tight text-xs text-fg-muted">
                {formatDate(v.date)}
              </span>
              {i === 0 && (
                <span className="rounded bg-circuit/10 px-1.5 py-0.5 font-mono-tight text-[10px] text-circuit">
                  LATEST
                </span>
              )}
            </div>
            <ChevronDown
              size={16}
              className={cn(
                "text-fg-muted transition-transform",
                openIndex === i && "rotate-180"
              )}
            />
          </button>
          {openIndex === i && (
            <ul className="space-y-1.5 px-4 pb-4">
              {v.notes.map((note, ni) => (
                <li key={ni} className="flex gap-2 text-sm text-fg-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-fg-muted" />
                  {note}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
