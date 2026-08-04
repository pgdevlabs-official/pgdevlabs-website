"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("PGDevLabs render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-bg-elevated p-10 text-center">
          <p className="font-mono-tight text-xs text-danger">RUNTIME_ERROR</p>
          <h3 className="text-lg font-medium">
            {this.props.fallbackTitle || "Something broke on our end."}
          </h3>
          <p className="max-w-sm text-sm text-fg-muted">
            The section failed to render. Reloading usually fixes it.
          </p>
          <Button variant="secondary" size="sm" onClick={() => this.setState({ hasError: false })}>
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
