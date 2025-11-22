import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: "export" for SSR deployment to Appwrite
  // Use default SSR mode for server-side rendering capabilities
  distDir: "build",

  // Enable standalone output for optimized deployment
  output: "standalone",
};

export default nextConfig;
