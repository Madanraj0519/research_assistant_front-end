import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import { useAuth } from "../../hooks/useAuth";

const LoginForm = ({ onSwitchToRegister }: { onSwitchToRegister: () => void }) => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });

  const validateForm = () => {
    const errors = {
      email: '',
      password: ''
    };
    let isValid = true;

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Assuming login function accepts credentials
      await login(formData);
      
      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('ra_remember_email', formData.email);
      } else {
        localStorage.removeItem('ra_remember_email');
      }
      
      navigate('/home'); // Auth hook should handle this
    } catch (err) {
      // Error is already handled by useAuth hook
      console.error('Login failed:', err);
    }
  };

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('ra_remember_email');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6 md:mb-8">
        <div className="bg-primary-600 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg shadow-primary-500/30">
          <BrainCircuit className="text-white w-7 h-7 md:w-8 md:h-8" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Research Assistant</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 md:mt-2 text-sm md:text-base">Sign in to access your workspace</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com" 
              required
              className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm md:text-base ${
                formErrors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {formErrors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••" 
              required
              className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm md:text-base ${
                formErrors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {formErrors.password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.password}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs md:text-sm">
            <label className="flex items-center text-gray-600 dark:text-gray-300">
              <input 
                type="checkbox" 
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="mr-1.5 md:mr-2 w-3.5 h-3.5 md:w-4 md:h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
              />
              Remember me
            </label>
            <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">Forgot password?</a>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-2.5 md:py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm md:text-base ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary-600 font-medium hover:underline focus:outline-none"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;