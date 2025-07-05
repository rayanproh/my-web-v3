import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Users, Clock, Hash } from 'lucide-react';
import { createGroupInvite } from '../../services/groupService';
import { useAuthContext } from '../../contexts/AuthContext';
import { Group } from '../../types/groups';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  group
}) => {
  const { user } = useAuthContext();
  
  // CRITICAL FIX: Move ALL hooks to top level - NEVER inside conditions
  const [inviteCode, setInviteCode] = useState('');
  const [expiresIn, setExpiresIn] = useState<number | undefined>(24); // hours
  const [maxUses, setMaxUses] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // FIXED: useEffect always called, condition inside
  useEffect(() => {
    if (isOpen && group.inviteCode) {
      setInviteCode(group.inviteCode);
    }
  }, [isOpen, group.inviteCode]);

  // Early return AFTER all hooks are called
  if (!isOpen) return null;

  const handleCreateInvite = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const code = await createGroupInvite(
        group.id,
        user.uid,
        expiresIn,
        maxUses
      );
      setInviteCode(code);
    } catch (error: any) {
      setError(error.message || 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteCode) return;

    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy invite:', error);
    }
  };

  const expirationOptions = [
    { value: 1, label: '1 hour' },
    { value: 6, label: '6 hours' },
    { value: 12, label: '12 hours' },
    { value: 24, label: '1 day' },
    { value: 168, label: '7 days' },
    { value: undefined, label: 'Never' }
  ];

  const maxUsesOptions = [
    { value: 1, label: '1 use' },
    { value: 5, label: '5 uses' },
    { value: 10, label: '10 uses' },
    { value: 25, label: '25 uses' },
    { value: 50, label: '50 uses' },
    { value: 100, label: '100 uses' },
    { value: undefined, label: 'No limit' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Invite Friends
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  to {group.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-xl p-4">
              <p className="text-red-600 dark:text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Current Invite */}
          {inviteCode && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Invite Link
                  </p>
                  <code className="text-sm bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 font-mono">
                    {inviteCode}
                  </code>
                </div>
                <button
                  onClick={handleCopyInvite}
                  className={`ml-3 p-2 rounded-lg transition-all ${
                    copied
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Invite Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Expire after
              </label>
              <select
                value={expiresIn || ''}
                onChange={(e) => setExpiresIn(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {expirationOptions.map((option) => (
                  <option key={option.label} value={option.value || ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Max number of uses
              </label>
              <select
                value={maxUses || ''}
                onChange={(e) => setMaxUses(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {maxUsesOptions.map((option) => (
                  <option key={option.label} value={option.value || ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleCreateInvite}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Invite...
              </div>
            ) : (
              'Generate New Invite'
            )}
          </button>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-xl p-4">
            <p className="text-blue-700 dark:text-blue-200 text-sm">
              <strong>Share this invite link</strong> with friends to let them join your server. 
              The link will expire based on your settings above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};