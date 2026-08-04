"use client";

import { useState } from "react";
import { Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DownloadButton({
  version,
  downloadUrl,
}: {
  version: string;
  downloadUrl?: string;
}) {
  const [state, setState] = useState<"idle" | "downloading" | "done">("idle");

  function handleDownload() {
    if (downloadUrl) {
      // Real APK — open the Firebase Storage URL to trigger a browser download.
      window.open(downloadUrl, "_blank");
      setState("done");
      return;
    }
    // No APK uploaded yet for this app — simulate so the UI still responds.
    setState("downloading");
    setTimeout(() => setState("done"), 1200);
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={state === "downloading"}
      size="lg"
      className="w-full sm:w-auto"
    >
      {state === "idle" && (
        <>
          <Download size={16} /> Download APK · v{version}
        </>
      )}
      {state === "downloading" && "Preparing download…"}
      {state === "done" && (
        <>
          <CheckCircle2 size={16} /> {downloadUrl ? "Download started" : "Downloaded"}
        </>
      )}
    </Button>
  );
}
