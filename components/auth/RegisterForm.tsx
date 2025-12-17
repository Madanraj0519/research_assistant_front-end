import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRoles } from "../../hooks/useRole";

const RegisterForm = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { roles, error: rolesError } = useRoles();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real app, you would send this data to your backend
    //   console.log('Registration data:', formData);/

    const { confirmPassword, ...registerData } = formData;
    await register(registerData);
    //   localStorage.setItem('ra_auth', 'true');
      localStorage.setItem('ra_user', JSON.stringify({
        username: formData.username,
        email: formData.email,
        role: formData.role
      }));
      navigate('/home');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-4 md:mb-6">
        <div className="bg-primary-600 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg shadow-primary-500/30">
          <BrainCircuit className="text-white w-7 h-7 md:w-8 md:h-8" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 md:mt-2 text-sm md:text-base">Join our research community</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input 
              type="text" 
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm md:text-base ${
                errors.username ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input 
              type="email" 
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm md:text-base ${
                errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input 
                type="password" 
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm md:text-base ${
                  errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input 
                type="password" 
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm md:text-base ${
                  errors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Your Role
            </label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm md:text-base appearance-none ${
                errors.role ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="" className="text-gray-400">Choose a role...</option>
              {roles?.data.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.roleName}
                </option>
              ))}
            </select>
            {rolesError && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{
                rolesError
              }</p>
            )}
          </div>
          
          <div className="flex items-center text-xs md:text-sm">
            <label className="flex items-center text-gray-600 dark:text-gray-300">
              <input 
                type="checkbox" 
                required
                className="mr-1.5 md:mr-2 w-3.5 h-3.5 md:w-4 md:h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
              />
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500 font-medium ml-1">
                Terms
              </a>{' '}
              &{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500 font-medium ml-1">
                Privacy
              </a>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="w-full py-2.5 md:py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm md:text-base"
          >
            Create Account
          </button>
        </form>
        
        <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary-600 font-medium hover:underline focus:outline-none"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;