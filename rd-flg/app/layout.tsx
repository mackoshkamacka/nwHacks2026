import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image"; 
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { AuthProvider } from '@/lib/AuthContext'; 

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });
  
  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });
  
  const headingFont = Space_Grotesk({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-heading",
  });
  
  const bodyFont = IBM_Plex_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-body",
  });

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} ${bodyFont.className} ${headingFont.variable} antialiased`}>
          <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 px-6 py-4 text-sm text-black backdrop-blur dark:border-white/10 dark:bg-black/70 dark:text-white">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
              
              <Link href="/" className="flex items-center group">
                <div className="relative h-16 w-48"> 
                  <Image 
                    src="/logo.svg" 
                    alt="RD-FLG Logo" 
                    fill
                    className="object-contain transition-transform group-hover:scale-105"
                    priority 
                  />
                </div>
              </Link>
              <nav className="flex items-center gap-6">
                <Link className="font-medium transition hover:text-rose-500" href="/login">
                  Login
                </Link>
                
                {/* UPDATED NAV SIGN UP BUTTON */}
                <Link 
                  href="/signup"
                  className="rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-blue-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 hover:brightness-110 shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)] active:scale-95" 
                >
                  Sign Up
                </Link>
              </nav>
            </div>
          </header>
  
          <main>
            <AuthProvider>
              {children}
            </AuthProvider>
          </main>
        </body>
      </html>
    );
  }
