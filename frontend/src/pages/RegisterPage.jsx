import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../store/authSlice.js';
import { getResolvedAvatarUrl, handleAvatarError } from '../utils/avatar.js';
import { validateImageFile } from '../utils/imageUpload.js';
import { uploadAvatar } from '../api/userApi.js';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarMode, setAvatarMode] = useState('url'); // 'url' | 'file'
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/chat');
  }, [isAuthenticated, navigate]);

  const previewName = useMemo(
    () => displayName.trim() || username.trim() || 'Your display name',
    [displayName, username]
  );

  const previewUsername = useMemo(
    () => (username.trim() ? `@${username.trim()}` : '@username'),
    [username]
  );

  const previewAvatar = useMemo(() => getResolvedAvatarUrl(avatarUrl), [avatarUrl]);

  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setFileError(validationError);
      return;
    }
    setFileError('');
    setUploading(true);
    try {
      const { url } = await uploadAvatar(file);
      setAvatarUrl(url);
    } catch {
      setFileError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(register({ displayName, username, email, password, avatarUrl }));
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-xl-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title mb-2">Sign Up</h2>
              <p className="text-muted mb-4">
                Create an account with your own display name and either a default avatar or an image you choose.
              </p>

              {/* Avatar preview */}
              <div className="register-avatar-shell mb-4">
                <div
                  className="register-avatar-preview"
                  style={{ cursor: 'pointer', position: 'relative' }}
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to choose an image"
                >
                  <img src={previewAvatar} alt={previewName} onError={handleAvatarError} />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 150ms',
                      borderRadius: 'inherit',
                      color: '#fff',
                      fontSize: 20,
                    }}
                    className="avatar-hover-overlay"
                  >
                    Change
                  </div>
                </div>
                <div className="register-avatar-copy">
                  <div className="register-avatar-title">{previewName}</div>
                  <div className="register-avatar-subtitle">{previewUsername}</div>
                  <div className="register-avatar-hint">
                    Click the image to upload one, or enter a URL below.
                  </div>
                </div>
              </div>

              <style>{`
                .register-avatar-preview:hover .avatar-hover-overlay { opacity: 1 !important; }
              `}</style>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Display name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Example: Alex Nguyen"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Used to log in"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ flex: 1 }}
                      aria-label="Password"
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-pressed={showPassword}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Avatar input: tabs for URL vs file */}
                <div className="mb-3">
                  <label className="form-label">Avatar</label>

                  <div className="type-toggle mb-2">
                    <button
                      type="button"
                      className={`type-option${avatarMode === 'url' ? ' selected' : ''}`}
                      onClick={() => setAvatarMode('url')}
                    >
                      Use URL
                    </button>
                    <button
                      type="button"
                      className={`type-option${avatarMode === 'file' ? ' selected' : ''}`}
                      onClick={() => { setAvatarMode('file'); fileInputRef.current?.click(); }}
                    >
                      Upload file
                    </button>
                  </div>

                  {avatarMode === 'url' ? (
                    <>
                      <input
                        type="url"
                        className="form-control"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                      />
                      <div className="form-text register-helper-text">
                        You can skip this and the system will use the default avatar.
                      </div>
                    </>
                  ) : (
                    <>
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
                        : avatarUrl
                        ? 'Image uploaded - click to change'
                        : 'Click to choose an image from your computer'}
                    </div>
                      {fileError && (
                        <div className="alert alert-danger mt-2 mb-0" style={{ padding: '8px 12px', fontSize: 13 }}>
                          {fileError}
                        </div>
                      )}
                      <div className="form-text register-helper-text">
                        JPG, PNG, GIF, WEBP - maximum 5MB.
                      </div>
                    </>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Creating...' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-3 text-center">
                <Link to="/login">Already have an account? Log in</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
