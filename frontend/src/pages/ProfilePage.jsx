import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, clearUpdateError } from '../store/authSlice.js';
import { getResolvedAvatarUrl, handleAvatarError } from '../utils/avatar.js';
import { validateImageFile } from '../utils/imageUpload.js';
import { uploadAvatar } from '../api/userApi.js';

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, updateLoading, updateError } = useSelector((state) => state.auth);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarMode, setAvatarMode] = useState('url');
  const [fileError, setFileError] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef(null);

  // Seed form from store
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.username || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  useEffect(() => {
    dispatch(clearUpdateError());
  }, [dispatch]);

  const previewAvatar = getResolvedAvatarUrl(avatarUrl);

  const [uploading, setUploading] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const validationError = validateImageFile(file);
        if (validationError) { setFileError(validationError); return; }
        setFileError('');
        setSelectedFileName(file.name);
        setUploading(true);
        try {
            const { url } = await uploadAvatar(file);
            setAvatarUrl(url);
        } catch {
            setFileError('Image upload failed. Please try again.');
            setSelectedFileName('');
        } finally {
            setUploading(false);
        }
    };

  const handleCancel = () => {
    setDisplayName(user?.displayName || user?.username || '');
    setEmail(user?.email || '');
    setAvatarUrl(user?.avatarUrl || '');
    setPassword('');
    setConfirmPassword('');
    setLocalError('');
    setFileError('');
    dispatch(clearUpdateError());
    setEditing(false);
    setSelectedFileName('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (password && password !== confirmPassword) {
      setLocalError('The confirmation password does not match.');
      return;
    }

    const payload = { id: user.id, displayName, email, avatarUrl };
    if (password) payload.password = password;

    try {
      await dispatch(updateProfile(payload)).unwrap();
      setSuccessMsg('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setEditing(false);
    } catch {
      // error shown from store
    }
  };

  if (!user) return null;

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          height: 'var(--topbar-h)',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/chat')}
          style={{ gap: 6 }}
        >
          &lt; Back
        </button>
        <span
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          My Profile
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          padding: '40px 16px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Profile card */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}
          >
            {/* Header gradient strip */}
            <div
              style={{
                height: 80,
                background: 'linear-gradient(135deg, var(--accent) 0%, #7b95fa 100%)',
              }}
            />

            {/* Avatar + name */}
            <div style={{ padding: '0 24px 24px', marginTop: -40 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 24,
                    overflow: 'hidden',
                    border: '3px solid var(--surface)',
                    boxShadow: 'var(--shadow)',
                    background: 'var(--surface-2)',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={previewAvatar}
                    alt={user.displayName}
                    onError={handleAvatarError}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {user.displayName || user.username}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                    @{user.username}
                  </div>
                </div>
              </div>

              {/* Info rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <InfoRow icon="-" label="Email" value={user.email} />
                <InfoRow icon="-" label="Role" value={user.role} />
                <InfoRow icon="-" label="Joined" value={formatDate(user.createdAt)} />
                <InfoRow
                  icon="-"
                  label="Status"
                  value={user.online ? 'Active now' : 'Inactive'}
                />
              </div>

              {!editing && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: 20, width: '100%' }}
                  onClick={() => { setEditing(true); setSuccessMsg(''); }}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Success message (outside edit form) */}
          {successMsg && !editing && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: '#e8f8f2',
                border: '1px solid rgba(52,201,139,.25)',
                color: 'var(--success)',
                fontSize: 13,
              }}
            >
              Success: {successMsg}
            </div>
          )}

          {/* Edit form */}
          {editing && (
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                padding: 24,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20, color: 'var(--text-primary)' }}>
                Edit Profile
              </div>

              <form onSubmit={handleSave}>
                {/* Avatar preview */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: 16,
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    background: 'linear-gradient(135deg, rgba(79,110,247,.08), rgba(255,255,255,.92))',
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      overflow: 'hidden',
                      border: '1px solid var(--border)',
                      flexShrink: 0,
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to change image"
                  >
                    <img
                      src={previewAvatar}
                      alt="preview"
                      onError={handleAvatarError}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 150ms',
                        color: '#fff', fontSize: 18, borderRadius: 'inherit',
                      }}
                      className="avatar-hover-overlay"
                    />
                  </div>
                  <style>{`.avatar-hover-overlay { } div:hover > .avatar-hover-overlay { opacity: 1 !important; }`}</style>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Click the image to upload one from your computer.
                  </div>
                </div>

                {/* Avatar mode tabs */}
                <div className="form-group">
                  <label className="form-label">Avatar</label>
                  <div className="type-toggle mb-2">
                    
                    <button
                      type="button"
                      className={`type-option${avatarMode === 'file' ? ' selected' : ''}`}
                      onClick={() => { setAvatarMode('file'); fileInputRef.current?.click(); }}
                    >
                      Upload file
                    </button>
                  </div>

                  {avatarMode === 'url' ? (
                    <input
                      type="url"
                      className="form-control"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  ) : (
                    <div
                    style={{
                        padding: '10px 13px',
                        border: '1.5px dashed var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-2)',
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        opacity: uploading ? 0.6 : 1,
                    }}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    >
                    {uploading
                        ? 'Uploading...'
                        : selectedFileName
                        ? `${selectedFileName}`
                        : ''}
                    </div>
                  )}

                  {fileError && (
                    <div className="alert alert-danger mt-2 mb-0" style={{ padding: '8px 12px', fontSize: 13 }}>
                      {fileError}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>

                {/* Display name */}
                <div className="form-group">
                  <label className="form-label">Display name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password change */}
                <div className="form-group">
                  <label className="form-label">New password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    autoComplete="new-password"
                  />
                  <div className="form-hint">Leave blank if you do not want to change your password.</div>
                </div>

                {password && (
                  <div className="form-group">
                    <label className="form-label">Confirm password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={Boolean(password)}
                    />
                  </div>
                )}

                {(localError || updateError) && (
                  <div className="alert alert-danger">
                    {localError || updateError}
                  </div>
                )}

                {successMsg && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#e8f8f2',
                      border: '1px solid rgba(52,201,139,.25)',
                      color: 'var(--success)',
                      fontSize: 13,
                      marginBottom: 16,
                    }}
                  >
                    Success: {successMsg}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    onClick={handleCancel}
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--surface-2)',
        fontSize: 13,
      }}
    >
      <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
      <span style={{ color: 'var(--text-tertiary)', flexShrink: 0, minWidth: 90 }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-all' }}>
        {value || '-'}
      </span>
    </div>
  );
}
