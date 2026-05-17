import type { Metadata } from "next";
import "./globals.css";

const BASE_PATH = '/garden-spline';

export const metadata: Metadata = {
  title: 'Garden Spline',
  description: 'Silly little parametric shell configurator.',
  icons: [{ url: `${BASE_PATH}/logo.svg`, type: 'image/svg+xml' }]
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
