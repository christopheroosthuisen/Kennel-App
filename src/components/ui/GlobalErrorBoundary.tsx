
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../Common";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  // Explicitly declare state property to satisfy TypeScript in strict mode
  public state: State = {
    hasError: false
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-slate-900">
          <Card className="w-full max-w-md shadow-lg border-red-200 bg-white">
            <CardHeader className="text-center">
              <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-900">Application Error</CardTitle>
              <CardDescription>
                Something went wrong while rendering this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 p-3 rounded-md text-xs font-mono text-slate-700 overflow-auto max-h-32 whitespace-pre-wrap">
                {this.state.error?.message || "Unknown Error"}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className="gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Reload Application
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
