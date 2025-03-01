import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Store data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);

        // Set cookies properly
        document.cookie = `token=${data.token}; path=/; max-age=86400`;
        document.cookie = `userRole=${data.role}; path=/; max-age=86400`;

        toast.success('Login successful!');

        // Use window.location.replace for clean redirect
        switch (data.role) {
          case 'admin':
            window.location.replace('/admin/dashboard');
            break;
          case 'canteen':
            window.location.replace('/canteen/dashboard');
            break;
          default:
            window.location.replace('/dashboard');
        }
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50/50 to-white px-4">
      <Head>
        <title>Login - QuickBite</title>
        <meta name="description" content="Login to your QuickBite account" />
        <link href="https://fonts.googleapis.com/css2?family=Righteous&display=swap" rel="stylesheet" />
      </Head>

      <motion.div
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Branding */}
        <div className="text-center">
          <h1 className="text-5xl font-righteous bg-gradient-to-r from-primary-600 to-primary-500 
            bg-clip-text text-transparent" style={{ fontFamily: 'Righteous, cursive' }}>
            QuickBite
          </h1>
          <p className="mt-3 text-primary-600/60">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl 
          border border-primary-100/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary-100 
                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    bg-white/50 transition-all"
                  placeholder="Email address"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-primary-100 
                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    bg-white/50 transition-all"
                  placeholder="Password"
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 
                    hover:text-primary-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-medium
                  bg-gradient-to-r from-primary-500 to-primary-600 
                  hover:from-primary-600 hover:to-primary-700 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 
                  focus:ring-offset-2 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </motion.button>
            </div>

            <div className="flex items-center justify-between text-sm text-primary-600">
              <Link href="/forgot-password" className="hover:underline">
                Forgot password?
              </Link>
              <Link href="/signup" className="hover:underline">
                Create account
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const { req, res } = context;
  
  // Clear any existing cookies on the login page
  res.setHeader('Set-Cookie', [
    'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT',
    'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
  ]);
  
  return {
    props: {}
  };
}
