// src/pages/_app.tsx
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import "@/styles/globals.css"; // Make sure Tailwind styles are loaded

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <AuthProvider>
            <div className="min-h-screen bg-black text-sci-fi-cyan font-sci antialiased">
              <Component {...pageProps} />
              <Toaster />
              <Sonner />
            </div>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
