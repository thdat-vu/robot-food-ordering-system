import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Ensure environment variables are available at build time
  experimental: {
    // This ensures environment variables are properly handled
    serverComponentsExternalPackages: [],
  },
};

export default withFlowbiteReact(nextConfig);