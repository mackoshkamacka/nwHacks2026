'use client';

import { useState } from 'react';
import { Building2, User, ShieldCheck, Fingerprint, Lock } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import Link from 'next/link';

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

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('customer'); // 'customer' or 'business'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Theme Constants
  const isBusiness = accountType === 'business';
  const themeColor = isBusiness ? 'blue' : 'rose';
  const themeGlow = isBusiness ? 'rgba(37,99,235,0.3)' : 'rgba(225,29,72,0.3)';

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: accountType,
        createdAt: new Date()
      });

      const destination = isBusiness ? '/business-dashboard' : '/customer-dashboard';
      router.push(destination);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: accountType,
        createdAt: new Date()
      }, { merge: true });

      const destination = isBusiness ? '/business-dashboard' : '/customer-dashboard';
      router.push(destination);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={`${bodyFont.className} ${headingFont.variable} relative min-h-screen flex items-center justify-center bg-[#060505] text-slate-50 px-4 py-12 overflow-hidden`}>
      
      {/* DYNAMIC BACKGROUND GLOWS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-bg {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        .animate-theme-glow {
          animation: pulse-bg 8s ease-in-out infinite;
        }
      `}} />

      {/* Pulsating Theme Glow (shifts position/color based on selection) */}
      <div 
        className="animate-theme-glow pointer-events-none absolute inset-0 transition-all duration-1000"
        style={{ 
          background: `radial-gradient(circle at ${isBusiness ? '80% 80%' : '20% 20%'}, ${themeGlow}, transparent 60%)` 
        }} 
      />

      <div className="relative z-10 w-full max-w-xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <h2 className="text-3xl font-bold text-white font-[var(--font-heading)] tracking-tight">Sign Up Below!</h2>
          <p className={`mt-2 uppercase text-[10px] tracking-[0.3em] font-bold transition-colors duration-500 ${isBusiness ? 'text-blue-500/60' : 'text-rose-500/60'}`}>
            Protect your {isBusiness ? 'Enterprises' : 'Legal'} interests by creating an account!
          </p>
        </div>
        
        {/* MAIN CARD - Dynamically colored borders */}
        <div className={`rounded-3xl border transition-all duration-500 bg-[#120808]/40 backdrop-blur-2xl shadow-2xl p-8 ${isBusiness ? 'border-blue-500/20' : 'border-rose-500/20'}`}>
          
          {error && (
            <div className={`mb-6 rounded-xl border px-4 py-3 text-sm animate-pulse ${isBusiness ? 'border-blue-500/30 bg-blue-500/10 text-blue-200' : 'border-rose-500/30 bg-rose-500/10 text-rose-200'}`}>
              <span className="font-bold uppercase text-[10px] block mb-1">Registration Blocked</span>
              {error}
            </div>
          )}

          {/* Account Type Selection */}
          <div className="mb-8">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4 text-center font-bold">
              Select Usecase
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Individual Toggle */}
              <button
                type="button"
                onClick={() => setAccountType('customer')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 ${
                  !isBusiness
                    ? 'border-rose-600 bg-rose-600/10 text-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.2)]'
                    : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'
                }`}
              >
                <User className="w-6 h-6 mb-2" />
                <span className="font-black text-xs tracking-widest">CUSTOMER</span>
                <span className="text-[9px] opacity-60 uppercase mt-1 tracking-tighter">Personal Use</span>
              </button>
              
              {/* Enterprise Toggle - Now Blue */}
              <button
                type="button"
                onClick={() => setAccountType('business')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 ${
                  isBusiness
                    ? 'border-blue-600 bg-blue-600/10 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                    : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'
                }`}
              >
                <Building2 className="w-6 h-6 mb-2" />
                <span className="font-black text-xs tracking-widest">ENTERPRISE</span>
                <span className="text-[9px] opacity-60 uppercase mt-1 tracking-tighter">Risk Mitigation</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white px-4 py-3.5 rounded-xl text-slate-950 font-black text-xs tracking-widest transition-all hover:bg-slate-200 mb-6 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            JOIN WITH GOOGLE
          </button>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t transition-colors duration-500 ${isBusiness ? 'border-blue-500/20' : 'border-rose-500/20'}`}></div>
            </div>
            <div className={`relative flex justify-center text-[10px] uppercase tracking-[0.4em] font-bold transition-colors duration-500 ${isBusiness ? 'text-blue-500/40' : 'text-rose-500/40'}`}>
              <span className="bg-[#0c0707] px-4">Sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-5">
            <div className="relative group">
              <label className={`block text-[10px] uppercase tracking-widest mb-2 ml-1 font-bold transition-colors duration-500 ${isBusiness ? 'text-blue-400/60' : 'text-rose-400/60'}`}>Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 transition-all placeholder:text-slate-800 ${isBusiness ? 'border-blue-500/20 focus:ring-blue-500/40' : 'border-rose-500/20 focus:ring-rose-500/40'}`}
                  placeholder="endouble@yew.plus"
                />
                <Fingerprint className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-500 ${isBusiness ? 'text-blue-500/20' : 'text-rose-500/20'}`} size={18} />
              </div>
            </div>

            <div className="relative group">
              <label className={`block text-[10px] uppercase tracking-widest mb-2 ml-1 font-bold transition-colors duration-500 ${isBusiness ? 'text-blue-400/60' : 'text-rose-400/60'}`}>Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 transition-all placeholder:text-slate-800 ${isBusiness ? 'border-blue-500/20 focus:ring-blue-500/40' : 'border-rose-500/20 focus:ring-rose-500/40'}`}
                  placeholder="••••••••"
                />
                <Lock className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-500 ${isBusiness ? 'text-blue-500/20' : 'text-rose-500/20'}`} size={18} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black tracking-[0.2em] transition-all duration-500 text-xs text-white hover:brightness-110 active:scale-[0.98] ${
                isBusiness 
                ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                : 'bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.3)]'
              }`}
            >
              {loading ? 'PROCESSING...' : `SIGNUP AS ${accountType.toUpperCase()}`}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-slate-500 uppercase tracking-widest font-bold">
            Already have an account? {' '}
            <Link href="/login" className={`transition-all underline underline-offset-8 decoration-white/10 hover:decoration-current ${isBusiness ? 'text-blue-500 hover:text-blue-400' : 'text-rose-500 hover:text-rose-400'}`}>
              Login Here
            </Link>
          </p>
        </div>

        <p className={`mt-8 text-center text-[9px] uppercase tracking-[0.5em] font-mono transition-colors duration-500 ${isBusiness ? 'text-blue-500/30' : 'text-rose-500/30'}`}>
          RD-FLG Secure Enrollment Node #99-X
        </p>
      </div>
    </div>
  );
}