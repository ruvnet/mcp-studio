import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MCP Studio | Web based ChatGPT plugin starter",
  description: "Run real MCP tools, inspect resources, and build an embedded ChatGPT interface.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
