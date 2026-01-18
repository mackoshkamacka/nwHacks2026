'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import Link from 'next/link';
import { ShieldAlert, Key, Fingerprint } from 'lucide-react';

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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const redirectBasedOnRole = async (user: any) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;
        router.push(role === 'business' ? '/business-dashboard' : '/customer-dashboard');
      } else {
        // If user logged in but has no doc, default to customer
        await setDoc(userDocRef, {
          email: user.email,
          role: 'customer',
          createdAt: new Date()
        });
        router.push('/customer-dashboard');
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setError('Protocol error: Failed to sync user profile.');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await redirectBasedOnRole(userCredential.user);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      await redirectBasedOnRole(result.user);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen flex items-center justify-center bg-[#0a0505] text-slate-50 px-4 overflow-hidden`}>
      {/* Red/Orange Warning Glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(225,29,72,0.12),_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(249,115,22,0.08),_transparent_40%)]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Branding */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <div className="h-8 w-8 rounded bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.5)] transition-transform group-hover:scale-110 flex items-center justify-center">
                <ShieldAlert size={18} className="text-white" />
            </div>
            <span className="font-[var(--font-heading)] text-2xl font-bold tracking-tight text-white group-hover:text-rose-500 transition-colors">RD-FLG</span>
          </Link>
          <div className="h-[1px] w-12 bg-rose-500/50 mb-4" />
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-rose-500/80">Terminal Access</h2>
        </div>

        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 backdrop-blur-xl shadow-2xl">
          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 animate-pulse">
              <span className="font-bold uppercase text-[10px] block mb-1">Access Denied</span>
              {error}
            </div>
          )}

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative w-full flex items-center justify-center gap-3 bg-white px-4 py-3.5 rounded-xl text-slate-950 font-bold transition-all hover:bg-rose-50 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'PROCESSING...' : 'UNSHACKLE WITH GOOGLE'}
          </button>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-rose-500/20"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] text-rose-500/50">
              <span className="bg-[#120808] px-4">Standard Protocol</span>
            </div>
          </div>

          {/* Email/Password Login */}
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="relative group">
              <label className="block text-[10px] uppercase tracking-widest text-rose-400/60 mb-2 ml-1 font-bold">
                Operator Identity
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-black/40 border border-rose-500/20 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all placeholder:text-slate-700"
                  placeholder="operator@nexus.io"
                />
                <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500/20 group-focus-within:text-rose-500/50 transition-colors" size={18} />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-[10px] uppercase tracking-widest text-rose-400/60 mb-2 ml-1 font-bold">
                Encryption Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-black/40 border border-rose-500/20 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all placeholder:text-slate-700"
                  placeholder="••••••••"
                />
                <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500/20 group-focus-within:text-rose-500/50 transition-colors" size={18} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 border border-rose-500 text-white rounded-xl px-4 py-4 font-black tracking-[0.2em] hover:bg-rose-500 hover:shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all disabled:opacity-50"
            >
              {loading ? 'DECRYPTING...' : 'INITIATE CONSOLE'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              Unregistered Identity?{' '}
              <Link href="/signup" className="text-rose-500 hover:text-orange-400 font-bold transition-colors underline underline-offset-4 decoration-rose-500/30 hover:decoration-orange-400">
                Register Protocol
              </Link>
            </p>
          </div>
        </div>

        {/* System Info Line */}
        <div className="mt-8 flex items-center justify-between px-2">
            <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-rose-500/20" />
            <span className="mx-4 text-[9px] text-rose-500/40 uppercase tracking-[0.5em] font-mono">
                System Status: Vigilant
            </span>
            <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-rose-500/20" />
        </div>
      </div>
    </div>
  );
}