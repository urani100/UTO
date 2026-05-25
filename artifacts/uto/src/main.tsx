import { setBaseUrl } from "@workspace/api-client-react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// In Capacitor builds VITE_API_BASE_URL is baked in at build time so that
// fetch("/api/...") resolves to the deployed server instead of capacitor://localhost.
if (import.meta.env.VITE_API_BASE_URL) {
  setBaseUrl(import.meta.env.VITE_API_BASE_URL);
}

createRoot(document.getElementById("root")!).render(<App />);
