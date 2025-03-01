import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUtensils, FaEnvelope, FaLock, FaUser, 
  FaGoogle, FaApple, FaArrowRight, FaExclamationCircle,
  FaChevronLeft
} from 'react-icons/fa';
import { toast } from 'react-toastify';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [returnUrl, setReturnUrl] = useState('/dashboard');
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  // Validation States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Get initial mode and returnUrl from query params
  useEffect(() => {
    const { mode: queryMode, returnUrl: queryReturnUrl } = router.query;
    if (queryMode === 'signup') setMode('signup');
    if (queryMode === 'forgot') setMode('forgot');
    if (queryReturnUrl && typeof queryReturnUrl === 'string') {
      setReturnUrl(queryReturnUrl);
    }
  }, [router.query]);

  // Show logout message
  useEffect(() => {
    if (router.query.logout === 'true') {
      toast.success('You have been logged out successfully');
    }
  }, [router.query]);

  // Validate email
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };
  
  // Validate password
  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail() || !validatePassword()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store auth data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        
        // Set cookies for server-side auth checks
        document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `userRole=${data.role}; path=/; max-age=86400; SameSite=Lax`;
        
        toast.success('Login successful!');
        
        // Use router.push for client-side redirect or window.location for hard refresh
        const redirectTo = getRedirectPath(data.role, returnUrl);
        window.location.href = redirectTo; // Use direct navigation for full page reload
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine redirect path based on role and return URL
  const getRedirectPath = (role: string, returnUrl: string) => {
    // If returnUrl is a role-specific dashboard, respect it
    if (returnUrl.includes('/admin/') && role === 'admin') return returnUrl;
    if (returnUrl.includes('/canteen/') && role === 'canteen') return returnUrl;
    
    // Otherwise, use role-based default routes
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'canteen': return '/canteen/dashboard';
      default: return returnUrl.startsWith('/') ? returnUrl : '/dashboard';
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail() || !validatePassword()) return;
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Account created! Please log in.');
        setMode('login');
        setPassword('');
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Reset token sent to your email');
        setShowResetForm(true);
      } else {
        throw new Error(data.error || 'Failed to send reset token');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail() || !validatePassword()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reset_token: resetToken, new_password: password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password reset successfully');
        setMode('login');
        setPassword('');
        setShowResetForm(false);
      } else {
        throw new Error(data.error || 'Failed to reset password');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-primary-900 to-primary-700 flex flex-col">
      <Head>
        <title>
          {mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Password Reset'} - QuickByte
        </title>
      </Head>

      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Brand Panel - Hidden on Mobile */}
        <div className="hidden md:flex md:w-1/2 lg:w-2/5 bg-gradient-to-br from-black/60 to-black/30 backdrop-blur-sm text-white p-8 lg:p-12 relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 -left-48 w-96 h-96 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center mb-12">
              <FaUtensils className="text-3xl text-primary-300 mr-3" />
              <h1 className="text-3xl font-bold">QuickByte</h1>
            </div>

            <div className="my-auto">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                {mode === 'login' ? (
                  "Welcome back!"
                ) : mode === 'signup' ? (
                  "Join our community"
                ) : (
                  "Reset your password"
                )}
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                {mode === 'login' ? (
                  "Log in to order your favorite food from the campus canteen."
                ) : mode === 'signup' ? (
                  "Create an account to enjoy quick and easy food ordering on campus."
                ) : (
                  "We'll help you get back into your account in no time."
                )}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-white/10 p-2 rounded-full">
                    <svg className="w-5 h-5 text-primary-200" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="ml-4 text-white/90">Fast and secure ordering</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/10 p-2 rounded-full">
                    <svg className="w-5 h-5 text-primary-200" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="ml-4 text-white/90">Real-time order tracking</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/10 p-2 rounded-full">
                    <svg className="w-5 h-5 text-primary-200" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="ml-4 text-white/90">Exclusive offers and discounts</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-white/60 mt-auto">
              &copy; {new Date().getFullYear()} QuickByte. All rights reserved.
            </div>
          </div>
        </div>
        
        {/* Right Auth Form Panel */}
        <div className="flex-1 flex flex-col bg-white md:rounded-l-3xl p-6 sm:p-8 md:p-12">
          <div className="md:hidden flex items-center mb-6">
            <FaUtensils className="text-2xl text-primary-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">QuickByte</h1>
          </div>
          
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            {/* Form Header */}
            <div className="mb-8 text-center md:text-left">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={mode}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="text-3xl font-bold text-gray-800"
                >
                  {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                </motion.h2>
                <motion.p
                  key={`${mode}-subtitle`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-600 mt-2"
                >
                  {mode === 'login' ? (
                    <>Don't have an account? <button onClick={() => setMode('signup')} className="text-primary-600 hover:text-primary-500 font-medium">Sign Up</button></>
                  ) : mode === 'signup' ? (
                    <>Already have an account? <button onClick={() => setMode('login')} className="text-primary-600 hover:text-primary-500 font-medium">Sign In</button></>
                  ) : (
                    <>Remember your password? <button onClick={() => setMode('login')} className="text-primary-600 hover:text-primary-500 font-medium">Sign In</button></>
                  )}
                </motion.p>
              </AnimatePresence>
            </div>
            
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                <FaGoogle className="text-red-500" />
                <span className="text-gray-700 font-medium">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors shadow-sm">
                <FaApple />
                <span className="font-medium">Apple</span>
              </button>
            </div>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">or continue with email</span>
              </div>
            </div>
            
            {/* Form Container */}
            <div className="relative flex-1">
              <AnimatePresence mode="wait">
                {/* Login Form */}
                {mode === 'login' && (
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleLogin}
                    className="space-y-5"
                  >
                    {/* Email Input */}
                    <div>
                      <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={validateEmail}
                          className={`block w-full pl-12 pr-4 py-3 border ${
                            emailError ? 'border-red-500' : 'border-gray-200'
                          } rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm`}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      {emailError && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FaExclamationCircle className="mr-1" /> {emailError}
                        </p>
                      )}
                    </div>
                    
                    {/* Password Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-sm text-primary-600 hover:text-primary-500"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          id="login-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={validatePassword}
                          className={`block w-full pl-12 pr-4 py-3 border ${
                            passwordError ? 'border-red-500' : 'border-gray-200'
                          } rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm`}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      {passwordError && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FaExclamationCircle className="mr-1" /> {passwordError}
                        </p>
                      )}
                    </div>
                    
                    {/* Remember Me */}
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    
                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isLoading ? 'Signing in...' : 'Sign In'}
                        {!isLoading && (
                          <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                        )}
                      </span>
                    </button>
                  </motion.form>
                )}

                {/* Signup Form */}
                {mode === 'signup' && (
                  <motion.form
                    key="signup-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSignup}
                    className="space-y-5"
                  >
                    {/* Name Input */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Email Input */}
                    <div>
                      <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={validateEmail}
                          className={`block w-full pl-12 pr-4 py-3 border ${
                            emailError ? 'border-red-500' : 'border-gray-200'
                          } rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm`}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      {emailError && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FaExclamationCircle className="mr-1" /> {emailError}
                        </p>
                      )}
                    </div>
                    
                    {/* Password Input */}
                    <div>
                      <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={validatePassword}
                          className={`block w-full pl-12 pr-4 py-3 border ${
                            passwordError ? 'border-red-500' : 'border-gray-200'
                          } rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm`}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      {passwordError && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FaExclamationCircle className="mr-1" /> {passwordError}
                        </p>
                      )}
                    </div>
                    
                    {/* Confirm Password Input */}
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`block w-full pl-12 pr-4 py-3 border ${
                            password !== confirmPassword && confirmPassword 
                              ? 'border-red-500' 
                              : 'border-gray-200'
                          } rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm`}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      {password !== confirmPassword && confirmPassword && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FaExclamationCircle className="mr-1" /> Passwords do not match
                        </p>
                      )}
                    </div>
                    
                    {/* Terms and Conditions */}
                    <div className="flex items-start">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                        required
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                        I agree to the <a href="#" className="text-primary-600 hover:text-primary-500">Terms of Service</a> and <a href="#" className="text-primary-600 hover:text-primary-500">Privacy Policy</a>
                      </label>
                    </div>
                    
                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isLoading ? 'Creating account...' : 'Create Account'}
                        {!isLoading && (
                          <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                        )}
                      </span>
                    </button>
                  </motion.form>
                )}

                {/* Forgot Password Form */}
                {mode === 'forgot' && !showResetForm && (
                  <motion.form
                    key="forgot-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleForgotPassword}
                    className="space-y-5"
                  >
                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                    >
                      <FaChevronLeft className="mr-1" /> Back to login
                    </button>
                    
                    <p className="text-gray-600">
                      Enter your email address and we'll send you a token to reset your password.
                    </p>
                    
                    {/* Email Input */}
                    <div>
                      <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                          id="forgot-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={validateEmail}
                          className={`block w-full pl-12 pr-4 py-3 border ${
                            emailError ? 'border-red-500' : 'border-gray-200'
                          } rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm`}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      {emailError && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FaExclamationCircle className="mr-1" /> {emailError}
                        </p>
                      )}
                    </div>
                    
                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isLoading ? 'Sending...' : 'Send Reset Token'}
                        {!isLoading && (
                          <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                        )}
                      </span>
                    </button>
                  </motion.form>
                )}

                {/* Reset Password Form */}
                {mode === 'forgot' && showResetForm && (
                  <motion.form
                    key="reset-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleResetPassword}
                    className="space-y-5"
                  >
                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => setShowResetForm(false)}
                      className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                    >
                      <FaChevronLeft className="mr-1" /> Back
                    </button>
                    
                    <p className="text-gray-600">
                      Enter the reset token sent to your email and your new password.
                    </p>
                    
                    {/* Reset Token Input */}
                    <div>
                      <label htmlFor="reset-token" className="block text-sm font-medium text-gray-700 mb-1">
                        Reset Token
                      </label>
                      <input
                        id="reset-token"
                        type="text"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                        placeholder="Enter token from email"
                        required
                      />
                    </div>
                    
                    {/* New Password Input */}
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          id="new-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={validatePassword}
                          className={`block w-full pl-12 pr-4 py-3 border ${
                            passwordError ? 'border-red-500' : 'border-gray-200'
                          } rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm`}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      {passwordError && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FaExclamationCircle className="mr-1" /> {passwordError}
                        </p>
                      )}
                    </div>
                    
                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                        {!isLoading && (
                          <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                        )}
                      </span>
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const { req, res, query } = context;
  const { returnUrl = '/dashboard', logout = false } = query;
  
  // Check if user is already authenticated with server-side cookies
  const cookies = req.cookies || {};
  const token = cookies.token;
  
  // Always clear cookies if logout=true
  if (logout === 'true' || logout === true) {
    res.setHeader('Set-Cookie', [
      'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax',
      'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax'
    ]);
    
    // Don't redirect, show the auth page
    return {
      props: {
        returnUrl: '/dashboard',
      }
    };
  }
  
  // Redirect authenticated users
  if (token && !logout) {
    const userRole = cookies.userRole || 'user';
    let destination = returnUrl || '/dashboard';
    
    // Role-based default redirects
    if (returnUrl === '/dashboard') {
      if (userRole === 'admin') {
        destination = '/admin/dashboard';
      } else if (userRole === 'canteen') {
        destination = '/canteen/dashboard';
      }
    }
    
    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  }
  
  // Clean cookies for non-authenticated users
  if (res && !token) {
    res.setHeader('Set-Cookie', [
      'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax',
      'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax'
    ]);
  }
  
  return {
    props: {
      returnUrl: returnUrl || '/dashboard',
    }
  };
}