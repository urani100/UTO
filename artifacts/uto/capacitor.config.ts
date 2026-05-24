import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.uto.studio",
  appName: "UTO",
  webDir: "dist/cap",
  server: {
    androidScheme: "https",
  },
};

export default config;
