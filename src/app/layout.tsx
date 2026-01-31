import type { Metadata } from 'next';
import './globals.css';
import { AuthContextProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';

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
      <body>
        <AuthContextProvider>
          <Navbar />
          <main className="min-h-screen bg-slate-50">
            {children}
          </main>
        </AuthContextProvider>
      </body>
    </html>
  );
}