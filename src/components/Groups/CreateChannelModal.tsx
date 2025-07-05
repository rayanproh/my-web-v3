import React, { useState } from 'react';
import { X, Hash, Volume2, Megaphone } from 'lucide-react';
import { createChannel } from '../../services/groupService';
import { useAuthContext } from '../../contexts/AuthContext';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  groupId
}) => {
  const { user } = useAuthContext();
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<'text' | 'voice' | 'announcement'>('text');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !channelName.trim()) return;

    setLoading(true);
    setError('');

    try {
      await createChannel(
        groupId,
        channelName.trim(),
        channelType,
        user.uid,
        undefined,
        description.trim() || undefined
      );
      
      onClose();
      setChannelName('');
      setDescription('');
      setChannelType('text');
    } catch (error: any) {
      setError(error.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setChannelName('');
    setDescription('');
    setChannelType('text');
    setError('');
    onClose();
  };

  const channelTypes = [
    {
      type: 'text' as const,
      icon: Hash,
      title: 'Text',
      description: 'Send messages, images, GIFs, emoji, opinions, and puns'
    },
    {
      type: 'voice' as const,
      icon: Volume2,
      title: 'Voice',
      description: 'Hang out together with voice, video, and screen share'
    },
    {
      type: 'announcement' as const,
      icon: Megaphone,
      title: 'Announcement',
      description: 'Important updates for your community'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Create Channel
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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

          {/* Channel Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Channel Type
            </label>
            <div className="space-y-2">
              {channelTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <label
                    key={type.type}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      channelType === type.type
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="channelType"
                      value={type.type}
                      checked={channelType === type.type}
                      onChange={(e) => setChannelType(e.target.value as any)}
                      className="sr-only"
                    />
                    <Icon className={`w-6 h-6 mt-0.5 ${
                      channelType === type.type ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <h3 className={`font-medium ${
                        channelType === type.type 
                          ? 'text-blue-900 dark:text-blue-100' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {type.title}
                      </h3>
                      <p className={`text-sm ${
                        channelType === type.type 
                          ? 'text-blue-700 dark:text-blue-200' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Channel Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Channel Name
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {channelType === 'text' && <Hash className="w-5 h-5 text-gray-400" />}
                {channelType === 'voice' && <Volume2 className="w-5 h-5 text-gray-400" />}
                {channelType === 'announcement' && <Megaphone className="w-5 h-5 text-gray-400" />}
              </div>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="new-channel"
                required
                maxLength={50}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Channel names must be lowercase and can contain dashes
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
              placeholder="What's this channel about?"
              rows={3}
              maxLength={200}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !channelName.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Channel...
              </div>
            ) : (
              'Create Channel'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};