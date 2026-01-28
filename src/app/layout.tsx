import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Book Collection App',
  description: 'Manage your book collection with Firebase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}