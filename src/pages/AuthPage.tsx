import React, { useState, lazy, Suspense } from 'react';

// Lazy load auth components for better performance
const LoginForm = lazy(() => import('../components/Auth/LoginForm').then(module => ({ default: module.LoginForm })));
const SignupForm = lazy(() => import('../components/Auth/SignupForm').then(module => ({ default: module.SignupForm })));

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Nokiatis</h1>
          <p className="text-gray-600 dark:text-gray-400">Connect, chat, and collaborate seamlessly</p>
        </div>

        <Suspense fallback={
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        }>
          {isLogin ? (
            <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </Suspense>
      </div>
    </div>
  );
};