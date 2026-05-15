import type { Metadata } from "next";
import "./globals.css";

const BASE_PATH = "/ppp";

export const metadata: Metadata = {
  title: "Next + React Three Fiber",
  description: "Static Next.js app with R3F",
  icons: [{ url: `${BASE_PATH}/logo.svg`, type: "image/svg+xml" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ ["--bg-logo-url" as any]: `url("${BASE_PATH}/logo.svg")` }}>
        {children}
      </body>
    </html>
  );
}
