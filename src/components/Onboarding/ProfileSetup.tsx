import React, { useState } from 'react';
import { Camera, User, Check, X, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../config/firebase';
import { useAuthContext } from '../../contexts/AuthContext';

interface ProfileSetupProps {
  onComplete: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const { user } = useAuthContext();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [aboutMe, setAboutMe] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
      setUsernameAvailable(!usernameDoc.exists());
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const cleanUsername = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleanUsername);
    
    if (cleanUsername.length >= 3) {
      checkUsernameAvailability(cleanUsername);
    } else {
      setUsernameAvailable(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !username || usernameAvailable !== true) return;

    setLoading(true);
    setError('');

    try {
      console.log('🚀 Starting profile completion...');
      let photoURL = profileImageUrl;

      // Upload profile image if selected
      if (profileImage) {
        console.log('📸 Uploading profile image...');
        const imageRef = ref(storage, `profile-images/${user.uid}`);
        const snapshot = await uploadBytes(imageRef, profileImage);
        photoURL = await getDownloadURL(snapshot.ref);
        console.log('✅ Profile image uploaded');
      }

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL
      });
      console.log('✅ Firebase Auth profile updated');

      // CRITICAL FIX: Update existing document (never create new)
      const userData = {
        username: username,
        displayName: displayName,
        photoURL: photoURL,
        aboutMe: aboutMe,
        profileCompleted: true, // Mark as completed
        // Keep existing fields, only update what's needed
        email: user.email!,
        status: 'Available',
        isOnline: true,
        lastSeen: new Date(),
        theme: 'light',
        blockedUsers: []
      };

      // SAFE UPDATE: Use setDoc with merge to update existing document
      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      console.log('✅ User document updated successfully');

      // Reserve username
      await setDoc(doc(db, 'usernames', username), {
        userId: user.uid,
        createdAt: new Date()
      });
      console.log('✅ Username reserved');

      console.log('🎉 Profile setup completed successfully!');
      onComplete();
    } catch (error: any) {
      console.error('❌ Profile setup error:', error);
      setError(error.message || 'Failed to complete profile setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <span className="text-white font-bold text-4xl">N</span>
            </div>
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-4">
            Complete Your Profile
          </h1>
          <p className="text-xl text-gray-300 max-w-md mx-auto leading-relaxed">
            Let's set up your Nokiatis profile and get you connected
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
          
          <div className="relative z-10">
            {error && (
              <div className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl backdrop-blur-sm animate-shake">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-red-200 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture */}
              <div className="text-center">
                <div className="relative inline-block group">
                  <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border-4 border-white/20 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-white/40">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-white/60" />
                      </div>
                    )}
                  </div>
                  <label htmlFor="profile-image" className="absolute bottom-3 right-3 w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <Camera className="w-6 h-6" />
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-gray-300 mt-4 font-medium">
                  Upload a profile picture (max 5MB)
                </p>
              </div>

              {/* Username */}
              <div className="space-y-3">
                <label htmlFor="username" className="block text-lg font-semibold text-white">
                  Username *
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg"
                    placeholder="Choose a unique username"
                    required
                    minLength={3}
                    maxLength={20}
                  />
                  <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                    {checkingUsername && (
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {!checkingUsername && username.length >= 3 && (
                      <>
                        {usernameAvailable === true && (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {usernameAvailable === false && (
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-scale-in">
                            <X className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {username.length >= 3 && (
                  <div className="text-sm font-medium">
                    {usernameAvailable === false && (
                      <p className="text-red-400 flex items-center gap-2 animate-slide-in">
                        <X className="w-4 h-4" />
                        Username is already taken
                      </p>
                    )}
                    {usernameAvailable === true && (
                      <p className="text-green-400 flex items-center gap-2 animate-slide-in">
                        <Check className="w-4 h-4" />
                        Username is available
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Display Name */}
              <div className="space-y-3">
                <label htmlFor="displayName" className="block text-lg font-semibold text-white">
                  Display Name *
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg"
                  placeholder="Your display name"
                  required
                  maxLength={50}
                />
              </div>

              {/* About Me */}
              <div className="space-y-3">
                <label htmlFor="aboutMe" className="block text-lg font-semibold text-white">
                  About Me
                </label>
                <textarea
                  id="aboutMe"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none text-lg"
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={200}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    {aboutMe.length}/200 characters
                  </p>
                  <div className="w-32 bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(aboutMe.length / 200) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !username || usernameAvailable !== true}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white py-5 px-8 rounded-2xl font-bold text-lg hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.02] flex items-center justify-center gap-4 relative overflow-hidden group"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Setting up your profile...
                  </>
                ) : (
                  <>
                    <Shield className="w-6 h-6" />
                    Complete Setup
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 leading-relaxed">
            By completing your profile, you agree to our{' '}
            <span className="text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">Terms of Service</span>
            {' '}and{' '}
            <span className="text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};