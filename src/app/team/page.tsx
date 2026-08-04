import type { Metadata } from "next";
import { getTeam } from "@/lib/dataService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the people building PGDevLabs.",
};

export default async function TeamPage() {
  const team = await getTeam();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10">
        <p className="font-mono-tight text-xs uppercase tracking-wide text-signal">Team</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
          The people behind it
        </h1>
        <p className="mt-3 max-w-lg text-sm text-fg-muted sm:text-base">
          Small team, real ownership. Everyone here ships end to end.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {team.map((member) => (
          <div
            key={member.id}
            className="rounded-lg border border-border bg-bg-elevated p-6"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-signal/10 font-display text-xl font-bold text-signal">
              {member.name.charAt(0)}
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{member.name}</h3>
            <p className="font-mono-tight text-xs text-signal">{member.role}</p>
            <p className="mt-3 text-sm text-fg-muted">{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
