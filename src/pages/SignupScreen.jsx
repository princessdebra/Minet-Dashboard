// SignupScreen.jsx
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, Check, X } from 'lucide-react';
import MinetLogo from '../assets/minet logo.jpeg';

const SignupScreen = ({ onSignup, onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [error, setError] = useState('');

  // Password requirements
  const passwordRequirements = [
    { id: 'length', text: 'At least 8 characters', regex: /.{8,}/ },
    { id: 'uppercase', text: 'One uppercase letter', regex: /[A-Z]/ },
    { id: 'lowercase', text: 'One lowercase letter', regex: /[a-z]/ },
    { id: 'number', text: 'One number', regex: /[0-9]/ },
    { id: 'special', text: 'One special character', regex: /[!@#$%^&*(),.?":{}|<>]/ }
  ];

  // Validate password strength
  const validatePassword = (password) => {
    const errors = [];
    passwordRequirements.forEach(req => {
      if (!req.regex.test(password)) {
        errors.push(req.id);
      }
    });
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  // Validate confirm password
  const validateConfirmPassword = (confirmPassword, password) => {
    if (confirmPassword && confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  // Handle password change
  const handlePasswordChange = (password) => {
    setFormData(prev => ({ ...prev, password }));
    validatePassword(password);
    if (formData.confirmPassword) {
      validateConfirmPassword(formData.confirmPassword, password);
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (confirmPassword) => {
    setFormData(prev => ({ ...prev, confirmPassword }));
    validateConfirmPassword(confirmPassword, formData.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate password strength
    if (!validatePassword(formData.password)) {
      setError('Please meet all password requirements');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed');
      }

      if (data.success) {
        // Show success message and redirect to login
        alert('Account created successfully! Please sign in.');
        onNavigateToLogin();
      } else {
        throw new Error(data.detail || 'Signup failed');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid = formData.fullName && 
                     formData.email && 
                     formData.password && 
                     formData.confirmPassword && 
                     passwordErrors.length === 0 && 
                     !confirmPasswordError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onNavigateToLogin}
            className="flex items-center text-red-600 hover:text-red-700 mb-4 mx-auto"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Login
          </button>
          
          {/* Minet Logo */}
          <div className="flex justify-center mb-6">
            <div> 
            {/* className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 p-2"> */}
              <img 
                src={MinetLogo}
                alt="Minet Kenya" 
                //className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback text if image fails */}
              <div className="hidden w-full h-full bg-red-600 rounded-full items-center justify-center">
                <span className="text-white font-bold text-sm">MINET</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join Minet Analytics platform</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    formData.password ? (passwordErrors.length === 0 ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
                  <div className="space-y-1">
                    {passwordRequirements.map(req => (
                      <div key={req.id} className="flex items-center text-sm">
                        {passwordErrors.includes(req.id) ? (
                          <X size={16} className="text-red-500 mr-2" />
                        ) : (
                          <Check size={16} className="text-green-500 mr-2" />
                        )}
                        <span className={passwordErrors.includes(req.id) ? 'text-gray-600' : 'text-green-600'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    formData.confirmPassword ? (confirmPasswordError ? 'border-red-500' : 'border-green-500') : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Confirm Password Error */}
              {confirmPasswordError && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X size={16} className="mr-1" />
                  {confirmPasswordError}
                </p>
              )}
              
              {/* Success Message */}
              {formData.confirmPassword && !confirmPasswordError && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <Check size={16} className="mr-1" />
                  Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onNavigateToLogin}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupScreen;