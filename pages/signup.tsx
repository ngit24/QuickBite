import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account created successfully!');
        window.location.replace('/login');
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50/50 to-white px-4">
      <Head>
        <title>Sign Up - QuickBite</title>
        <meta name="description" content="Create your QuickBite account" />
        <link href="https://fonts.googleapis.com/css2?family=Righteous&display=swap" rel="stylesheet" />
      </Head>

      <motion.div
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center">
          <h1 className="text-5xl font-righteous bg-gradient-to-r from-primary-600 to-primary-500 
            bg-clip-text text-transparent" style={{ fontFamily: 'Righteous, cursive' }}>
            QuickBite
          </h1>
          <p className="mt-3 text-primary-600/60">Create your account</p>
        </div>

        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl 
          border border-primary-100/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { icon: FaUser, name: 'name', type: 'text', placeholder: 'Full Name' },
              { icon: FaEnvelope, name: 'email', type: 'email', placeholder: 'Email address' },
              { 
                icon: FaLock, 
                name: 'password', 
                type: showPasswords.password ? 'text' : 'password', 
                placeholder: 'Password',
                showToggle: true 
              },
              { 
                icon: FaLock, 
                name: 'confirmPassword', 
                type: showPasswords.confirmPassword ? 'text' : 'password', 
                placeholder: 'Confirm Password',
                showToggle: true 
              }
            ].map(({ icon: Icon, showToggle, ...field }) => (
              <div key={field.name} className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  {...field}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-primary-100 
                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    bg-white/50 transition-all"
                  onChange={handleInputChange}
                />
                {showToggle && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 
                      hover:text-primary-600 transition-colors"
                    onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      [field.name]: !prev[field.name as keyof typeof showPasswords]
                    }))}
                  >
                    {showPasswords[field.name as keyof typeof showPasswords] ? 
                      <FaEyeSlash /> : <FaEye />}
                  </button>
                )}
              </div>
            ))}

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
              {isLoading ? 'Creating account...' : 'Create Account'}
            </motion.button>

            <div className="text-center text-sm text-primary-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}