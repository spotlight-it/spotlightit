import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpotlightIt — discover & cheer on independent creators",
  description:
    "A directory for finding small, independent creators by niche and supporting them with public encouragement.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SpotlightIt",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="site">
          <header className="site-header">
            <a href="/" className="brand">
              ✦ SpotlightIt
            </a>
            <nav>
              <a href="/browse">Browse</a>
              <a href="/submit">Submit a creator</a>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            <p>
              SpotlightIt — no listing goes live without the creator's okay.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
