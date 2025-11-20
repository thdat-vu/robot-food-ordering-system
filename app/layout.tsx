import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "../styles/globals.css";
import {TableProvider} from "@/hooks/context/Context";
import {ProductProvider} from "@/hooks/context/ContextProduct";
import {FastOrderProvider} from "@/hooks/context/FastOrderContext";
import {DeviceTokenProvider} from "@/hooks/context/deviceTokenContext";
import {InternetGuard} from "@/components/common/InternetGuard";
import {BrowserRedirect} from "@/components/common/BrowserRedirect";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "OrderingFood",
    description: "OrderingFood",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "OrderingFood",
    },
    openGraph: {
        type: "website",
        siteName: "OrderingFood",
        title: "OrderingFood",
        description: "OrderingFood",
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
        <head>
            <meta name="apple-mobile-web-app-capable" content="yes"/>
            <meta name="mobile-web-app-capable" content="yes"/>
            <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        </head>
        <body className="antialiased min-h-screen flex flex-col justify-end items-center bg-white">
        <BrowserRedirect/>
        <InternetGuard>
            <DeviceTokenProvider>
                <TableProvider>
                    <ProductProvider>
                        <FastOrderProvider>
                            {children}
                        </FastOrderProvider>
                    </ProductProvider>
                </TableProvider>
            </DeviceTokenProvider>
        </InternetGuard>
        </body>
        </html>
    );
}