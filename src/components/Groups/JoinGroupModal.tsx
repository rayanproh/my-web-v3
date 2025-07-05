import React, { useState } from 'react';
import { X, Users, ArrowRight } from 'lucide-react';
import { joinGroupByInvite } from '../../services/groupService';
import { useAuthContext } from '../../contexts/AuthContext';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupJoined: (groupId: string) => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupJoined
}) => {
  const { user } = useAuthContext();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode.trim()) return;

    setLoading(true);
    setError('');

    try {
      const groupId = await joinGroupByInvite(inviteCode.trim(), user.uid);
      onGroupJoined(groupId);
      setInviteCode('');
    } catch (error: any) {
      setError(error.message || 'Failed to join server');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInviteCode('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Join a Server</h2>
                <p className="text-blue-100 text-sm">Enter an invite below to join an existing server</p>
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

          {/* Invite Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Invite Link or Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter invite code (e.g., abc123XY)"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Invites look like: <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">abc123XY</code>
            </p>
          </div>

          {/* Example */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Don't have an invite?
            </h3>
            <p className="text-blue-700 dark:text-blue-200 text-sm">
              Ask a friend to send you an invite link, or create your own server to get started!
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !inviteCode.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Joining Server...
              </>
            ) : (
              <>
                Join Server
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};