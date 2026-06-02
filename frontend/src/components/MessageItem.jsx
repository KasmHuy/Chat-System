import { useDispatch } from 'react-redux';
import { deleteMessage, markMessageRead } from '../store/messageSlice.js';

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageItem({ message, currentUserId }) {
  const dispatch = useDispatch();
  const isOwn = message.senderId === currentUserId;
  const isDeleted = message.deleted;
  const content = isDeleted ? 'This message was deleted' : message.content;
  const messageId = message.id || message.messId;

  const handleDelete = async () => {
    if (!messageId || !message.conversationId) return;
    await dispatch(deleteMessage({ conversationId: message.conversationId, messageId }));
  };

  const statusLabel = isDeleted
    ? 'Deleted'
    : isOwn
      ? message.readAt
        ? 'Read'
        : 'Sent'
      : null;

  return (
    <div className={`message-row${isOwn ? ' own' : ''}`}>
      {!isOwn && (
        <div className="message-sender-avatar">
          {message.senderName ? message.senderName.charAt(0).toUpperCase() : '?'}
        </div>
      )}

      <div className={`message-bubble${isOwn ? ' own' : ' other'}${isDeleted ? ' deleted' : ''}`}>
        {content}

        {isOwn && !isDeleted && (
          <div className="message-actions">
            <button
              type="button"
              className="message-action-btn"
              onClick={handleDelete}
              aria-label="Delete message"
            >
              &times;
            </button>
          </div>
        )}

        <div className="message-meta">
          {statusLabel && <span className="message-status">{statusLabel}</span>}
          {message.edited && !isDeleted && (
            <span className="message-edited">edited -</span>
          )}
          <span className="message-time">{formatTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
