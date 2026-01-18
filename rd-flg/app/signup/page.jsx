// app/signup/page.jsx (App Router)
// OR pages/signup.jsx (Pages Router)

'use client'; // Only if using App Router

import { useState } from 'react';
import { Building2, User } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation'; // App Router
// import { useRouter } from 'next/router'; // Pages Router

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('customer'); // 'customer' or 'business'
  const [error, setError] = useState('');
  const router = useRouter();

  // Email/Password Signup
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore with selected account type
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: accountType, // Use selected account type
        createdAt: new Date()
      });

      // Navigate based on account type
      const destination = accountType === 'business' ? '/business-dashboard' : '/receipts';
      router.push(destination);
    } catch (err) {
      setError(err.message);
    }
  };

  // Google Signup
  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create user profile in Firestore with selected account type
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: accountType, // Use selected account type
        createdAt: new Date()
      }, { merge: true }); // merge: true prevents overwriting existing data

      // Navigate based on account type
      const destination = accountType === 'business' ? '/business-dashboard' : '/receipts';
      router.push(destination);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Sign Up</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Account Type Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 text-center">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAccountType('customer')}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                accountType === 'customer'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <User className="w-8 h-8 mb-2" />
              <span className="font-medium">Customer</span>
            </button>
            
            <button
              type="button"
              onClick={() => setAccountType('business')}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                accountType === 'business'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <Building2 className="w-8 h-8 mb-2" />
              <span className="font-medium">Business</span>
            </button>
          </div>
        </div>

        {/* Google Sign Up */}
        <button
          onClick={handleGoogleSignup}
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Email/Password Sign Up */}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleEmailSignup}
            type="button"
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 font-medium"
          >
            Sign Up as {accountType === 'customer' ? 'Customer' : 'Business'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}