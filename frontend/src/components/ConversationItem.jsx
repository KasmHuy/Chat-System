import {
  getConversationAvatarFallback,
  getConversationAvatarUrl,
  getConversationDisplayName,
  getConversationPreviewText,
  isConversationOnline,
  isPrivateConversation,
} from '../utils/conversationDisplay.js';
import { handleAvatarError } from '../utils/avatar.js';

const AVATAR_COLORS = ['accent', 'green', 'orange', 'purple', 'red'];

function getAvatarColor(name = '') {
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + character.charCodeAt(0)) & 0xffff;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatTime(iso) {
  if (!iso) return '';

  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
}

export default function ConversationItem({ conversation, selected, onClick, currentUserId }) {
  const name = getConversationDisplayName(conversation, currentUserId);
  const avatarUrl = getConversationAvatarUrl(conversation, currentUserId);
  const avatarFallback = getConversationAvatarFallback(conversation, currentUserId);
  const preview = getConversationPreviewText(conversation, currentUserId);
  const color = getAvatarColor(name);
  const privateConversation = isPrivateConversation(conversation);
  const online = isConversationOnline(conversation, currentUserId);

  return (
    <button
      type="button"
      className={`conv-item${selected ? ' active' : ''}`}
      onClick={onClick}
    >
      <div className="conv-avatar-wrap">
        <div className={`conv-avatar ${color}`}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              onError={handleAvatarError}
            />
          ) : (
            avatarFallback
          )}
        </div>
        {privateConversation && (
          <span
            className={`presence-dot presence-dot--avatar ${online ? 'online' : 'offline'}`}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="conv-info">
        <div className="conv-name-row">
          <span className="conv-name">{name}</span>
          <span className="conv-time">{formatTime(conversation.updatedAt)}</span>
        </div>
        <div className="conv-preview">{preview}</div>
      </div>
    </button>
  );
}
