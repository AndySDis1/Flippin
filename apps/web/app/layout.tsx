import './globals.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { Providers } from '../components/providers';
import { TopNav } from '../components/top-nav';

export const metadata: Metadata = {
  title: "Flippin' | AI Reselling HQ",
  description: 'Inventory intake, AI listings, cross-posting, and analytics in one stack.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          <div className="min-h-screen">
            <TopNav />
            <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
