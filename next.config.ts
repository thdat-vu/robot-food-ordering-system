import {NextConfig} from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
    allowedDevOrigins: [
        "http://192.168.110.46:3000",
        "http://192.168.110.99:3000",
        "http://localhost:3000",
    ],

    compress: true,

    images: {
        domains: ["thachan.vn"],
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
            },
            {
                protocol: "https",
                hostname: "be-robo.zd-dev.xyz",
            },
            {
                protocol: "https",
                hostname: "encrypted-tbn0.gstatic.com",
            },
            {
                protocol: "https",
                hostname: "cdn.tgdd.vn",
            },
            {
                protocol: "https",
                hostname: "thachan.vn",
            },
            {
                protocol: "https",
                hostname: "**",
            },
            {
                protocol: "http",
                hostname: "**",
            },
        ],
        formats: ["image/avif", "image/webp"],
        minimumCacheTTL: 60,
    },

    swcMinify: true,

    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },

    experimental: {
        optimizePackageImports: ["lucide-react", "react-icons"],
    },
};

export default nextConfig;
