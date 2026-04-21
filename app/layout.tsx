import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getConfiguration } from "@/lib/actions/configuration";
import { Providers } from "@/lib/providers";

const APP_NAME = "Billing and Revenue Portal";
const APP_DESCRIPTION = "Internal Billing Management System";
const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* REMOVE export const metadata */

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await getConfiguration();

    const appName = config?.name || APP_NAME;
    const favicon = config?.favicon || "/favicon.ico";

    return {
      title: {
        template: `%s | ${appName}`,
        default: appName,
      },
      description: APP_DESCRIPTION,
      metadataBase: new URL(SERVER_URL),
      icons: {
        icon: [
          { url: favicon },
          { url: favicon, rel: "shortcut icon" },
        ],
        apple: [{ url: favicon }],
      },
    };
  } catch (error) {
    return {
      title: {
        template: `%s | ${APP_NAME}`,
        default: APP_NAME,
      },
      description: APP_DESCRIPTION,
      metadataBase: new URL(SERVER_URL),
      icons: {
        icon: "/favicon.ico",
      },
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Providers>
          <div className="flex">
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}