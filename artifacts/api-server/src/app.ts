import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
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
// Capacitor WebView origins for iOS and Android native apps
allowedOrigins.add("capacitor://localhost");
allowedOrigins.add("https://localhost");
app.use(
  cors({
    credentials: true,
    origin(origin, cb) {
      // Same-origin requests (no Origin header), curl/server-to-server,
      // and explicitly allowlisted Replit hosts only.
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      // Don't 500 — just omit CORS headers so the browser blocks the response.
      cb(null, false);
    },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

export default app;
