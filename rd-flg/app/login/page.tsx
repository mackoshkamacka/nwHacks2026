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
    <div className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen flex items-center justify-center bg-[#060505] text-slate-50 px-4 overflow-hidden`}>
      
      {/* BALANCED BACKGROUND GLOW SYSTEM */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.1); }
        }
        .animate-glow {
          animation: pulse-glow 8s ease-in-out infinite;
        }
      `}} />

      <div className="animate-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(225,29,72,0.25),_transparent_60%)]" />
      <div className="animate-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(37,99,235,0.2),_transparent_60%)]" style={{ animationDelay: '-4s' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Branding */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <div className="h-8 w-8 rounded bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.5)] transition-transform group-hover:scale-110 flex items-center justify-center">
                <ShieldAlert size={18} className="text-white" />
            </div>
            <span className="font-[var(--font-heading)] text-2xl font-bold tracking-tight text-white transition-colors">RD-FLG</span>
          </Link>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent mb-4" />
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-rose-500/80">enterprise & consumer Login page</h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#120808]/60 backdrop-blur-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 animate-pulse">
              <span className="font-bold uppercase text-[10px] block mb-1 text-rose-500">Access Denied</span>
              {error}
            </div>
          )}

          {/* Google Login - Interactive Styling */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative w-full flex items-center justify-center gap-3 bg-white px-4 py-3.5 rounded-xl text-slate-950 font-black text-xs tracking-widest transition-all hover:scale-[1.02] hover:bg-slate-100 active:scale-95 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'PROCESSING...' : 'LOGIN WITH GOOGLE'}
          </button>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">
              <span className="bg-[#0c0707] px-4">Login with email below</span>
            </div>
          </div>

          {/* Email/Password Login */}
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="relative group">
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2 ml-1 font-bold transition-colors group-focus-within:text-rose-500">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all placeholder:text-slate-800"
                  placeholder="endouble@yew.plus"
                />
                <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-rose-500/40 transition-colors" size={18} />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2 ml-1 font-bold transition-colors group-focus-within:text-rose-500">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all placeholder:text-slate-800"
                  placeholder="••••••••"
                />
                <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-rose-500/40 transition-colors" size={18} />
              </div>
            </div>

            {/* GRADIENT SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-blue-500 px-4 py-4 font-black text-xs uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_0_30px_rgba(225,29,72,0.4)] active:scale-95 disabled:opacity-50"
            >
              {loading ? 'LOADING...' : 'LOGIN WITH EMAIL'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Not signed up yet? {' '} {' '}
              <Link href="/signup" className="text-rose-500 hover:text-white transition-all underline underline-offset-8 decoration-rose-500/30">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* System Info Line */}
        <div className="mt-8 flex items-center justify-between px-2">
            <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-white/10" />
            <span className="mx-4 text-[9px] text-slate-600 uppercase tracking-[0.5em] font-mono">
                System Status: Vigilant
            </span>
            <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-white/10" />
        </div>
      </div>
    </div>
  );
}