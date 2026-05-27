import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { ClerkProvider, useClerk, useAuth } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { clerkAppearance } from "@/lib/clerkAppearance";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UtoMark } from "@/components/editor/Logo";
import NotFound from "@/pages/not-found";
import Studio from "@/pages/Studio";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";

// In Capacitor the WebView hostname is "localhost", not the real domain.
// Prefer the key baked in at build time; fall back to host-based lookup for web.
const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  publishableKeyFromHost(
    window.location.hostname,
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  );

// In Capacitor the Vite base is "./" for relative asset paths, which makes
// BASE_URL = "./" and basePath = "." — a relative token that breaks Clerk's
// path-routing and signInUrl/signUpUrl props. Use "" (root) instead.
const basePath = import.meta.env.VITE_IS_CAPACITOR === "true"
  ? ""
  : import.meta.env.BASE_URL.replace(/\/$/, "");
// In Capacitor the app runs at capacitor://localhost. The proxy at
// /api/__clerk is registered before the CORS middleware in app.ts, so it
// never adds Access-Control-Allow-Origin headers — every Clerk API call
// from the WebView is blocked. Skip the proxy entirely in Capacitor and
// let Clerk call its own servers directly; they handle CORS themselves.
const clerkProxyUrl = import.meta.env.VITE_IS_CAPACITOR === "true"
  ? undefined
  : import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in env");
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

// In Capacitor there are no shared cookies between the WebView and the server.
// Wire Clerk's getToken to the API client so every request carries a
// Bearer token instead of relying on cookies.
function ClerkCapacitorAuthSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    if (import.meta.env.VITE_IS_CAPACITOR !== "true") return;
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);
  return null;
}

function SplashScreen() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#eeece7]">
      <UtoMark height={28} />
    </div>
  );
}

function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoaded && !isSignedIn) setLocation("/sign-in");
  }, [isLoaded, isSignedIn, setLocation]);

  if (!isLoaded) return <SplashScreen />;
  if (!isSignedIn) return null;
  return <Studio />;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Sign in to UTO",
            subtitle: "Save and revisit your shape compositions.",
          },
        },
        signUp: {
          start: {
            title: "Create your UTO account",
            subtitle: "A small library, kept just for you.",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <ClerkCapacitorAuthSync />
        <TooltipProvider delayDuration={250}>
          <Switch>
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/" component={Studio} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

/**
 * Lightweight client-side hardening: blocks the right-click context menu
 * and the most common "view source / open devtools" keyboard shortcuts.
 * This is a deterrent only — anyone determined can still open DevTools
 * via the browser menu — but it prevents casual inspection.
 */
function useDisableInspection() {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      // F12 — open DevTools
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd+U — view source
      if (ctrlOrMeta && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd+Shift+I/J/C — DevTools / console / inspect element
      if (
        ctrlOrMeta &&
        e.shiftKey &&
        ["i", "j", "c"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd+S — would otherwise prompt the browser save-page dialog.
      // Studio.tsx already handles ⌘S for its own save action; intercepting
      // here is a safety net for routes that don't (sign-in / sign-up).
      if (ctrlOrMeta && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}

function App() {
  useDisableInspection();
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
