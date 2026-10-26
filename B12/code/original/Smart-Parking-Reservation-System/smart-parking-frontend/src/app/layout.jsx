import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SmartPark',
  description: 'Book your parking slot instantly.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen flex flex-col`} suppressHydrationWarning>
        <Navbar />
        
        <main className="grow pb-16 lg:pb-0">
          {children}
        </main>

        <BottomNav />
      </body>
    </html>
  );
}