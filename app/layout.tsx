import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#111827", 
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tspeed-fm30.vercel.app"),

  title: {
    default: "VELO | High-Performance Typing Benchmark",
    template: "%s | VELO", 
  },
  
  description: "Master your keystrokes with VELO. A minimalist, distraction-free typing speed test designed for developers and precision typists.",
  
  applicationName: "VELO",
  
  keywords: [
    "typing speed test", 
    "wpm benchmark", 
    "developer typing tool", 
    "minimalist typing test", 
    "coding speed test",
    "typing practice"
  ],

  authors: [{ name: "Emafido Emmanuel Aridon", url: "https://github.com/Emafido" }],
  creator: "Emafido Emmanuel Aridon",
  publisher: "VELO",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tspeed-fm30.vercel.app",
    title: "VELO | The Developer's Typing Engine",
    description: "Measure your Words Per Minute (WPM) and accuracy with real-time analytics. Minimalist and fast.",
    siteName: "VELO",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "VELO Typing Interface",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "VELO | High-Performance Typing Benchmark",
    description: "Test your WPM in a minimalist, distraction-free environment.",
    images: ["/og-image.png"], 
    creator: "@EmmanuelEmafido", 
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 selection:bg-gray-900 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}