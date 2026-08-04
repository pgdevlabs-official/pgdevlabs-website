import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-mono-tight text-sm text-danger">404_NOT_FOUND</p>
      <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
        This route doesn&apos;t exist.
      </h1>
      <p className="mt-3 text-fg-muted">
        The page you&apos;re looking for was moved, renamed, or never shipped.
      </p>
      <div className="mt-6 flex gap-3">
        <Button href="/">Go home</Button>
        <Button href="/apps" variant="secondary">
          Browse apps
        </Button>
      </div>
      <Link href="/contact" className="mt-6 text-xs text-fg-muted hover:text-fg">
        Think this is a bug? Let us know →
      </Link>
    </div>
  );
}
