import React from 'react';
import { MessageCircle, Users, Zap, Shield, Sparkles } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 text-center">
        {/* Premium Logo */}
        <div className="relative inline-block mb-12">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 animate-float">
            <span className="text-white font-bold text-5xl">N</span>
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Brand */}
        <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-6">
          Nokiatis
        </h1>
        
        {/* Loading animation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-4 h-4 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Status */}
        <p className="text-2xl text-gray-300 font-medium mb-8">
          Loading your conversations...
        </p>
        
        {/* Feature highlights */}
        <div className="flex items-center justify-center gap-8 text-gray-400 mb-8">
          <div className="flex items-center gap-2 group hover:text-purple-300 transition-colors">
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Real-time Chat</span>
          </div>
          <div className="flex items-center gap-2 group hover:text-blue-300 transition-colors">
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Group Conversations</span>
          </div>
          <div className="flex items-center gap-2 group hover:text-cyan-300 transition-colors">
            <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Lightning Fast</span>
          </div>
          <div className="flex items-center gap-2 group hover:text-green-300 transition-colors">
            <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Secure</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-96 bg-white/10 rounded-full h-2 mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full animate-loading-bar"></div>
        </div>
        
        {/* Loading tips */}
        <div className="mt-8 text-gray-400 text-sm">
          <p>💡 Tip: Use @ to mention users in group chats</p>
        </div>
      </div>
    </div>
  );
};