import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// CORS: only reflect explicitly allowlisted origins. Reflecting arbitrary
// origins while sending credentials would let any third-party site call the
// API with the user's session cookie.
// Set ALLOWED_ORIGINS to a comma-separated list of web origins to permit
// (e.g. "https://your-app.com,https://staging.your-app.com").
// Capacitor WebView origins for iOS and Android are always allowed.
const allowedOrigins = new Set<string>();
for (const d of (process.env.ALLOWED_ORIGINS ?? "").split(",")) {
  const t = d.trim();
  if (t) allowedOrigins.add(t);
}
allowedOrigins.add("capacitor://localhost");
allowedOrigins.add("https://localhost");
app.use(
  cors({
    credentials: true,
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      cb(null, false);
    },
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Use env vars directly — the Replit-specific publishableKeyFromHost lookup
// is not needed outside of Replit and adds an unnecessary failure point.
app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  }),
);

app.use("/api", router);

// Global JSON error handler — must be registered after all routes and must
// declare all four parameters so Express recognises it as an error handler.
// Without this, Express returns an HTML 500 page for any unhandled error,
// which breaks API clients that expect JSON.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? Number((err as { status: unknown }).status)
      : 500;
  const message =
    err instanceof Error ? err.message : "Internal server error";

  req.log?.error({ err }, "Unhandled error");

  if (!res.headersSent) {
    res.status(status).json({ error: message });
  }
});

export default app;
