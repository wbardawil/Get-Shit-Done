import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@bds/types": path.resolve(__dirname, "../src/types"),
      "@bds/constants": path.resolve(__dirname, "../src/constants"),
    },
  },
};

export default nextConfig;
