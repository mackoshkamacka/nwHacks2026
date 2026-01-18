"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; 
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { AuthProvider, useAuth } from "@/lib/AuthContext"; 
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
          <AuthProvider>
            <HeaderNav />
              <main>
                {children}
              </main>
          </AuthProvider>
        </body>
      </html>
    );
  }

function HeaderNav() {
  const { user } = useAuth() as { user: { email?: string | null } | null };
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    setDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 px-6 py-4 text-sm text-black backdrop-blur dark:border-white/10 dark:bg-black/70 dark:text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link href={user ? "/customer-dashboard" : "/"} className="flex items-center group">
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
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/customer-dashboard"
                  className="rounded-full border border-slate-200/60 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow-sm transition hover:border-slate-400 hover:shadow"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="rounded-full border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-900 shadow-sm transition hover:border-slate-400 hover:shadow"
                >
                  Profile
                </button>
              </>
            ) : (
              <>
                <Link className="font-medium transition hover:text-rose-500" href="/login">
                  Login
                </Link>
                <Link 
                  href="/signup"
                  className="rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-blue-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 hover:brightness-110 shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)] active:scale-95" 
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className={`fixed inset-0 z-60 transition ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-80 bg-white p-8 text-slate-900 shadow-2xl transition-transform duration-300 dark:bg-[#0b1220] dark:text-white ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="mb-10 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Profile</p>
            <button className="text-xs text-slate-500 hover:text-slate-800" onClick={() => setDrawerOpen(false)}>
              Close
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-500">Signed in as</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-rose-400 hover:text-rose-500 dark:border-white/20 dark:bg-transparent dark:text-white"
            >
              Log out
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
