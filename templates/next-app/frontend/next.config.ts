import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal standalone server for the production Docker image.
  output: "standalone",
};

export default nextConfig;
