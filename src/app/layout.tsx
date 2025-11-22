import { ClientAppProviders } from "@/components/client-app-providers";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Typoria - Multilingual Typing Test & Practice",
    template: "%s | Typoria",
  },
  description:
    "Typoria is a minimalistic and modern typing test and practice tool. Test your typing speed and accuracy in English, Lisu, and Myanmar languages with real-time feedback and detailed statistics.",
  keywords: [
    "typing test",
    "typing practice",
    "WPM test",
    "typing speed",
    "typing accuracy",
    "words per minute",
    "multilingual typing",
    "Lisu typing",
    "Myanmar typing",
    "keyboard practice",
    "typing tutor",
    "online typing test",
    "free typing test",
    "typing speed test",
    "typing game",
    "improve typing speed",
    "learn typing",
  ],
  authors: [{ name: "Typoria", url: "https://typoria.sites.codibyte.io" }],
  creator: "Typoria",
  publisher: "Typoria",
  applicationName: "Typoria",
  category: "Education",
  classification: "Typing Test Application",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://typoria.sites.codibyte.io"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Typoria - Multilingual Typing Test & Practice",
    description:
      "Test your typing speed and accuracy in English, Lisu, and Myanmar languages. Modern, minimalistic typing test with real-time feedback and detailed statistics.",
    siteName: "Typoria",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Typoria - Multilingual Typing Test",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Typoria - Multilingual Typing Test & Practice",
    description: "Test your typing speed and accuracy in English, Lisu, and Myanmar languages with real-time feedback.",
    images: ["/og-image.png"],
    creator: "@typoria",
    site: "@typoria",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Typoria",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    // Add these when you set up Google Search Console and Bing Webmaster Tools
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://typoria.sites.codibyte.io";

  // Structured Data (JSON-LD) for better SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${baseUrl}/#webapp`,
        name: "Typoria",
        alternateName: "Typoria Typing Test",
        url: baseUrl,
        description:
          "Multilingual typing test and practice tool supporting English, Lisu, and Myanmar languages. Test your typing speed and accuracy with real-time feedback and detailed statistics.",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web Browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Real-time typing speed measurement (WPM)",
          "Accuracy tracking and analysis",
          "Support for English, Lisu, and Myanmar languages",
          "Multiple keyboard layout options",
          "Detailed performance statistics",
          "Global leaderboard",
          "Practice and competition modes",
          "Dark and light theme support",
        ],
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        softwareVersion: "1.0.0",
        author: {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`,
        },
        publisher: {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "Typoria",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.svg`,
          width: "512",
          height: "512",
        },
        sameAs: [
          // Add your social media profiles here when available
          // "https://twitter.com/typoria",
          // "https://github.com/typoria",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          availableLanguage: ["en", "my"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Typoria",
        description: "Multilingual typing test and practice tool",
        publisher: {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`,
        },
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientAppProviders>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </ClientAppProviders>
      </body>
    </html>
  );
}
