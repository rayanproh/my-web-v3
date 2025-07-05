import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { createGroup } from '../../services/groupService';
import { useAuthContext } from '../../contexts/AuthContext';
import { Group } from '../../types/groups';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (group: Group) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated
}) => {
  const { user } = useAuthContext();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Icon size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !groupName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const groupId = await createGroup(
        user.uid,
        groupName.trim(),
        description.trim() || undefined,
        iconFile || undefined
      );

      // Create a temporary group object for immediate UI update
      const newGroup: Group = {
        id: groupId,
        name: groupName.trim(),
        description: description.trim() || undefined,
        iconURL: iconPreview || undefined,
        ownerId: user.uid,
        createdAt: new Date(),
        memberCount: 1,
        isPublic: false,
        settings: {
          defaultNotifications: true,
          explicitContentFilter: 'members_without_roles',
          verificationLevel: 'none'
        }
      };

      onGroupCreated(newGroup);
      
      // Reset form
      setGroupName('');
      setDescription('');
      setIconFile(null);
      setIconPreview('');
    } catch (error: any) {
      setError(error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setDescription('');
    setIconFile(null);
    setIconPreview('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create Your Server</h2>
                <p className="text-purple-100 text-sm">Your server is where you and your friends hang out</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-xl p-4">
              <p className="text-red-600 dark:text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Server Icon */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border-4 border-purple-200 dark:border-purple-700 flex items-center justify-center group cursor-pointer">
                {iconPreview ? (
                  <img
                    src={iconPreview}
                    alt="Server icon"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-purple-400" />
                )}
                <label
                  htmlFor="icon-upload"
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-white" />
                </label>
              </div>
              <input
                id="icon-upload"
                type="file"
                accept="image/*"
                onChange={handleIconUpload}
                className="hidden"
              />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Upload a server icon (optional)
            </p>
          </div>

          {/* Server Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Server Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter server name"
              required
              maxLength={50}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {groupName.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
              placeholder="Tell people what your server is about"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description.length}/200 characters
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !groupName.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Server...
              </div>
            ) : (
              'Create Server'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};