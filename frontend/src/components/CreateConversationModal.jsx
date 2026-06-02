import { useEffect, useMemo, useState } from 'react';
import { searchUsers } from '../api/userApi.js';
import { getErrorMessage } from '../utils/apiError.js';
import { handleAvatarError, getResolvedAvatarUrl } from '../utils/avatar.js';
import { getUserDisplayName } from '../utils/conversationDisplay.js';

export default function CreateConversationModal({ show, onClose, onCreate, currentUserId }) {
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!show) {
      setName('');
      setQuery('');
      setResults([]);
      setSelectedMembers([]);
      setSearchLoading(false);
      setError(null);
      setSubmitting(false);
    }
  }, [show]);

  const selectedMemberIds = useMemo(
    () => new Set(selectedMembers.map((member) => Number(member.id))),
    [selectedMembers]
  );

  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setResults([]);
      setSearchLoading(false);
      return undefined;
    }

    let active = true;
    const timeoutId = window.setTimeout(async () => {
      setSearchLoading(true);
      setError(null);
      try {
        const data = await searchUsers(normalizedQuery);
        if (!active) return;
        const filtered = data.filter(
          (user) =>
            Number(user.id) !== Number(currentUserId) && !selectedMemberIds.has(Number(user.id))
        );
        setResults(filtered);
      } catch (err) {
        if (!active) return;
        console.error('[CreateConversationModal] search error', err);
        setResults([]);
        setError('Unable to search for users to add to the group.');
      } finally {
        if (active) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [currentUserId, query, selectedMemberIds, show]);

  if (!show) return null;

  const handleAddMember = (user) => {
    setError(null);
    setSelectedMembers((current) => {
      if (current.some((member) => Number(member.id) === Number(user.id))) {
        return current;
      }
      return [...current, user];
    });
    setResults((current) => current.filter((member) => Number(member.id) !== Number(user.id)));
  };

  const handleRemoveMember = (memberId) => {
    setSelectedMembers((current) => current.filter((member) => Number(member.id) !== Number(memberId)));
  };

  const handleCreate = async () => {
    setError(null);
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter a group name.');
      return;
    }

    if (selectedMembers.length < 1) {
      setError('Please select at least one member for the group chat.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        type: 'GROUP',
        name: trimmedName,
        memberIds: selectedMembers.map((member) => member.id),
      });
    } catch (err) {
      console.error('[CreateConversationModal] create error', err);
      setError(getErrorMessage(err, 'Unable to create the group chat. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card group-modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Create Group Chat</h2>
            <p className="modal-subtitle">
              Name the group and choose members directly. No manual IDs needed.
            </p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body group-builder">
          <div className="group-builder__section">
            <label htmlFor="conversation-name" className="form-label">
              Group name
            </label>
            <input
              id="conversation-name"
              type="text"
              className="search-input"
              placeholder="Example: Project team, Tonight's study group..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              autoFocus
            />
          </div>

          <div className="group-builder__section">
            <div className="group-builder__section-head">
              <label htmlFor="member-search" className="form-label">
                Add members
              </label>
              <span className="group-builder__summary">You + {selectedMembers.length} members</span>
            </div>
            <input
              id="member-search"
              type="text"
              className="search-input"
              placeholder="Search by username or email to add people..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setError(null);
              }}
            />
            <div className="search-panel__hint">Choose at least one other person to create a new group.</div>
          </div>

          {selectedMembers.length > 0 && (
            <div className="group-builder__section">
              <div className="group-builder__section-head">
                <div className="form-label">Selected members</div>
              </div>
              <div className="selected-members">
                {selectedMembers.map((member) => (
                  <div key={member.id} className="selected-member-chip">
                    <div className="selected-member-chip__avatar">
                      <img
                        src={getResolvedAvatarUrl(member)}
                        alt={getUserDisplayName(member)}
                        onError={handleAvatarError}
                      />
                    </div>
                    <div className="selected-member-chip__info">
                      <div className="selected-member-chip__name">{getUserDisplayName(member)}</div>
                      <div className="selected-member-chip__meta">@{member.username}</div>
                    </div>
                    <button
                      type="button"
                      className="selected-member-chip__remove"
                      onClick={() => handleRemoveMember(member.id)}
                      aria-label={`Remove ${member.username} from the group`}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="alert alert-danger modal-alert">{error}</div>}

          <div className="group-builder__section">
            {searchLoading && (
              <div className="search-panel__state">
                <div className="spinner" style={{ display: 'inline-block' }} />
                <span>Searching for users...</span>
              </div>
            )}

            {!searchLoading && !query.trim() && (
              <div className="search-panel__empty">
                Search for users to add to the group. You can add or remove members before creating it.
              </div>
            )}

            {!searchLoading && query.trim() && results.length === 0 && (
              <div className="search-panel__empty">
                No more matching results to add to the group.
              </div>
            )}

            {!searchLoading && results.length > 0 && (
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
                      className="btn btn-outline btn-sm"
                      onClick={() => handleAddMember(user)}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer modal-footer--flush">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create group'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
