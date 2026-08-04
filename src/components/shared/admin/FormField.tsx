export function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-fg-muted">{label}</label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:border-signal";
