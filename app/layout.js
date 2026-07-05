import './globals.css';
import Navbar from '@/components/Navbar';
import StarfieldBackground from '@/components/StarfieldBackground';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: 'Starfield Chronicles | AI-Powered RPG Log & Creator Hub',
  description: 'Track your RPG journey through the Settled Systems with AI-assisted character generation, persistent Captain logs, mod showcases, and galactic news updates.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Outfit', sans-serif" }}>
        <StarfieldBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-10 md:px-8">
            {children}
          </main>
          <footer className="relative z-10 w-full text-center py-6 text-xs text-slate-500 border-t border-white/5 bg-space-950/80 backdrop-blur-md">
            <p className="tracking-wider uppercase">© 2026 Starfield Chronicles. Built for Constellation Explorers.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
