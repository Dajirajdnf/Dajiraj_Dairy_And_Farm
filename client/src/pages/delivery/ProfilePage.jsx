import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlinePhone, HiOutlineMail, HiOutlineLogout } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900">My Profile</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 font-extrabold text-3xl rounded-full flex items-center justify-center mx-auto shadow-inner">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold uppercase bg-emerald-50 text-emerald-700 tracking-wider">
            {user?.role}
          </span>
        </div>

        <div className="pt-3 border-t border-gray-100 text-left space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <HiOutlinePhone className="w-4 h-4 text-gray-400" />
            <span>{user?.phone || 'No phone recorded'}</span>
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineMail className="w-4 h-4 text-gray-400" />
            <span>{user?.email || 'No email recorded'}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition"
        >
          <HiOutlineLogout className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <HiOutlineLockClosed className="w-4 h-4 text-emerald-600" /> Change Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Repeat new password"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
