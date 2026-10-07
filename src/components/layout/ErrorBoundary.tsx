"use client";

import React from "react";
import { Cta } from "@/components/ui/Cta";
import { SmileGraphic } from "@/components/ui/SmileGraphic";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="relative flex min-h-screen items-center justify-center bg-bone px-6">
          <div className="mx-auto max-w-md text-center">
            <SmileGraphic className="mx-auto mb-6 h-16 w-24 text-cocoa/30" animated={false} />
            <h1 className="font-display text-5xl font-bold tracking-tight text-cocoa">
              Something went wrong
            </h1>
            <p className="mt-4 text-cocoa/70">
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page or
              contact us if the problem persists.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Cta href="/" variant="lime">
                Go home
              </Cta>
              <Cta href="/contact" variant="outline">
                Contact support
              </Cta>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}