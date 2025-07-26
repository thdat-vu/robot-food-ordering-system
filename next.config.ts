import {NextConfig} from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
    // @ts-ignore
    allowedDevOrigins: [
        'http://192.168.110.46:3000',
        'http://192.168.110.99:3000',
        'http://localhost:3000',
    ],


};

export default nextConfig;
