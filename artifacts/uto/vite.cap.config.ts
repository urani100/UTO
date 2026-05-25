import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { cpSync } from "fs";
import { createRequire } from "module";

const _require = createRequire(import.meta.url);

function copyClerkJsPlugin(): Plugin {
  return {
    name: "copy-clerk-js",
    closeBundle() {
      const clerkJsDistDir = path.dirname(
        _require.resolve("@clerk/clerk-js/dist/clerk.browser.js")
      );
      const destDir = path.resolve(import.meta.dirname, "dist/cap");
      cpSync(clerkJsDistDir, destDir, { recursive: true });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname), "VITE_");

  return {
    base: "./",
    plugins: [
      react(),
      tailwindcss({ optimize: false }),
      copyClerkJsPlugin(),
    ],
    define: {
      "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(
        env.VITE_CLERK_PUBLISHABLE_KEY ?? ""
      ),
      "import.meta.env.VITE_CLERK_PROXY_URL": JSON.stringify(
        env.VITE_CLERK_PROXY_URL ?? ""
      ),
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
        env.VITE_API_BASE_URL ?? ""
      ),
      "import.meta.env.VITE_IS_CAPACITOR": JSON.stringify("true"),
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/cap"),
      emptyOutDir: true,
    },
  };
});
