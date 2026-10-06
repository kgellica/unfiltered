import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { uploadFile } from '../../api/uploads';
import { Camera, Loader2, Check } from 'lucide-react';
import Avatar from '../Avatar';
import { formatName } from '../../lib/text';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const avatarInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [profileName, setProfileName] = useState(formatName(user?.name) || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileName(formatName(user.name) || '');
      setProfileEmail(user.email || '');
    }
  }, [user]);

  const handleCancelProfile = () => {
    setProfileName(formatName(user?.name) || '');
    setProfileEmail(user?.email || '');
    setProfileError('');
    setProfileSuccess(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    const formatted = formatName(profileName);
    if (!formatted.trim()) {
      setProfileError('name cannot be empty.');
      return;
    }
    if (!profileEmail.trim()) {
      setProfileError('email cannot be empty.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.patch('/user/profile', { name: formatted, email: profileEmail });
      updateUser(res.data?.user || { name: formatted, email: profileEmail });
      setProfileName(formatted);
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(err?.response?.data?.message || 'failed to update profile. try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('please upload a valid picture format (e.g. jpg, png).');
      e.target.value = '';
      return;
    }
    setAvatarUploading(true);
    try {
      const url = await uploadFile(file, 'photo');
      if (url) {
        await api.patch('/user/profile', { avatar_url: url });
        updateUser({ avatar_url: url });
      }
    } catch (err) {
      alert(err.message || 'failed to upload photo.');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="flex flex-col gap-6 pt-2">
      <div className="flex flex-col items-center">
        <div className="relative">
          <Avatar user={user} size={112} />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition disabled:opacity-60 cursor-pointer"
            style={{ background: 'var(--accent)', color: 'white' }}
            title="upload profile picture"
          >
            {avatarUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          </button>
        </div>
        <input
          type="file"
          ref={avatarInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleAvatarChange}
        />
      </div>

      {profileError && (
        <p className="text-[12px] text-red-500 text-center font-medium">{profileError}</p>
      )}
      {profileSuccess && (
        <p className="text-[12px] text-emerald-500 font-bold text-center flex items-center justify-center gap-1">
          <Check size={14} /> profile updated successfully!
        </p>
      )}

      <div>
        <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-1.5">name</label>
        <input
          type="text"
          value={profileName}
          onChange={(e) => {
            setProfileName(e.target.value);
            setProfileSuccess(false);
            setProfileError('');
          }}
          onBlur={() => setProfileName(formatName(profileName))}
          className="w-full px-4 py-3 rounded-2xl text-[14px] font-medium outline-none border border-[var(--border-soft)] text-[var(--ink)] focus:border-[var(--accent)] transition capitalize"
          style={{ background: 'var(--surface-muted)' }}
          placeholder="enter your name"
        />
      </div>

      <div>
        <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-1.5">email</label>
        <input
          type="email"
          value={profileEmail}
          onChange={(e) => {
            setProfileEmail(e.target.value);
            setProfileSuccess(false);
            setProfileError('');
          }}
          className="w-full px-4 py-3 rounded-2xl text-[14px] font-medium outline-none border border-[var(--border-soft)] text-[var(--ink)] focus:border-[var(--accent)] transition"
          style={{ background: 'var(--surface-muted)' }}
          placeholder="enter your email"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleCancelProfile}
          disabled={profileLoading}
          className="flex-1 py-3 rounded-2xl text-[14px] font-bold border border-[var(--border-soft)] text-[var(--ink-soft)] hover:bg-[var(--surface-muted)] transition cursor-pointer disabled:opacity-50"
        >
          cancel
        </button>
        <button
          type="submit"
          disabled={profileLoading}
          className="flex-1 py-3 rounded-2xl text-[14px] font-bold text-white transition hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'var(--accent)' }}
        >
          {profileLoading ? <Loader2 size={16} className="animate-spin" /> : 'save changes'}
        </button>
      </div>
    </form>
  );
}