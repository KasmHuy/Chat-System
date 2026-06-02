import { useEffect, useState } from 'react';
import { searchUsers } from '../api/userApi.js';
import { getErrorMessage } from '../utils/apiError.js';
import { handleAvatarError, getResolvedAvatarUrl } from '../utils/avatar.js';
import { getUserDisplayName } from '../utils/conversationDisplay.js';

export default function SearchFriendsModal({ show, onClose, currentUserId, onStartConversation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatLoading, setChatLoading] = useState(null);

  useEffect(() => {
    if (!show) {
      setQuery('');
      setResults([]);
      setLoading(false);
      setError(null);
      setChatLoading(null);
    }
  }, [show]);

  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setResults([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let active = true;
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchUsers(normalizedQuery);
        if (!active) return;
        const filtered = data.filter((user) => Number(user.id) !== Number(currentUserId));
        setResults(filtered);
      } catch (err) {
        if (!active) return;
        console.error('[SearchFriendsModal] search error', err);
        setResults([]);
        setError('Unable to search for users right now.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [currentUserId, query, show]);

  const handleStartChat = async (user) => {
    setError(null);
    setChatLoading(user.id);
    try {
      await onStartConversation(user);
      setQuery('');
      setResults([]);
      onClose();
    } catch (err) {
      console.error('[SearchFriendsModal] create chat error', err);
      setError(getErrorMessage(err, 'Unable to create the conversation.'));
    } finally {
      setChatLoading(null);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card finder-modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Find Friends</h2>
            <p className="modal-subtitle">
              Search by username or email and start a private conversation faster.
            </p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <input
            type="text"
            className="search-input"
            placeholder="Enter a name or email to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="search-panel__hint">Results are filtered so you will not see yourself.</div>

          {error && <div className="alert alert-danger modal-alert">{error}</div>}

          {loading && (
            <div className="search-panel__state">
              <div className="spinner" style={{ display: 'inline-block' }} />
              <span>Searching...</span>
            </div>
          )}

          {!loading && !query.trim() && (
            <div className="search-panel__empty">
              Enter a keyword to find friends and start a private chat from the results.
            </div>
          )}

          {!loading && results.length === 0 && query.trim() && (
            <div className="search-panel__empty">No matching users found.</div>
          )}

          {!loading && results.length > 0 && (
            <div className="search-results search-results--spacious">
              {results.map((user) => (
                <div key={user.id} className="search-result-item search-result-item--actionable">
                  <div className="search-result-item__main">
                    <div className="search-result-avatar">
                      <img
                        src={getResolvedAvatarUrl(user)}
                        alt={getUserDisplayName(user)}
                        onError={handleAvatarError}
                      />
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-name">{getUserDisplayName(user)}</div>
                      {user.displayName && <div className="search-result-meta">@{user.username}</div>}
                      <div className="search-result-email">{user.email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleStartChat(user)}
                    disabled={chatLoading === user.id}
                  >
                    {chatLoading === user.id ? 'Creating...' : 'Message'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
