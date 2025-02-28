import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

interface TabProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}

const Tab = ({ isActive, label, onClick }: TabProps) => (
  <div 
    className={`py-2 px-3 text-center cursor-pointer rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-primary-600 text-white' 
        : 'text-textSecondary hover:bg-primary-50'
    }`}
    onClick={onClick}
  >
    {label}
  </div>
);

export default function AuthTabs() {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  
  // Reset password form state
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token exactly as received
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userName', data.name);
        
        toast.success('Login successful!');
        
        // Role-based navigation
        switch (data.role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'canteen':
            router.push('/canteen/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Account created successfully! Please log in.');
        setActiveTab('login');
        setLoginEmail(signupEmail);
      } else {
        throw new Error(data.error || 'Signup failed');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Reset token sent to your email');
        setResetEmail(forgotEmail);
        setActiveTab('reset');
      } else {
        throw new Error(data.error || 'Failed to send reset token');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          reset_token: resetToken,
          new_password: newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password reset successfully!');
        setActiveTab('login');
        setLoginEmail(resetEmail);
      } else {
        throw new Error(data.error || 'Failed to reset password');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-card p-8">
      <h1 className="text-2xl font-semibold text-center text-textPrimary mb-6">QuickByte Auth</h1>
      
      <div className="grid grid-cols-4 gap-2 p-1 bg-background rounded-lg mb-6">
        <Tab 
          isActive={activeTab === 'login'} 
          label="Login" 
          onClick={() => handleTabChange('login')}
        />
        <Tab 
          isActive={activeTab === 'signup'} 
          label="Signup" 
          onClick={() => handleTabChange('signup')}
        />
        <Tab 
          isActive={activeTab === 'forgot'} 
          label="Forgot" 
          onClick={() => handleTabChange('forgot')}
        />
        <Tab 
          isActive={activeTab === 'reset'} 
          label="Reset" 
          onClick={() => handleTabChange('reset')}
        />
      </div>
      
      {/* Login Tab */}
      {activeTab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-70"
          >
            {isLoading ? 'Signing in...' : 'Sign in to account'}
          </button>
        </form>
      )}
      
      {/* Signup Tab */}
      {activeTab === 'signup' && (
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">
              Full name
            </label>
            <input
              type="text"
              required
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              placeholder="Create password (min. 8 characters)"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-70"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      )}
      
      {/* Forgot Password Tab */}
      {activeTab === 'forgot' && (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-70"
          >
            {isLoading ? 'Sending...' : 'Send recovery token'}
          </button>
        </form>
      )}
      
      {/* Reset Password Tab */}
      {activeTab === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              placeholder="Confirm your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">
              Reset token
            </label>
            <input
              type="text"
              required
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              placeholder="Enter reset token"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">
              New password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-70"
          >
            {isLoading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      )}
    </div>
  );
}
