import { useEffect, useRef } from 'react';
import MessageItem from './MessageItem.jsx';

function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function formatDateLabel(iso) {
  const d = new Date(iso);
  const now = new Date();
  if (isSameDay(iso, now)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(iso, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: '2-digit' });
}

export default function MessageList({ messages, currentUserId, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="state-center">
        <div className="spinner" />
        <span>Loading messages...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="empty-chat">
        <div className="empty-chat__icon">💬</div>
        <div className="empty-chat__title">No messages yet</div>
        <div className="empty-chat__sub">Start the conversation!</div>
      </div>
    );
  }

  // Group messages by day to add date separators.
  const items = [];
  let lastDate = null;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const msgDate = msg.createdAt;

    if (!lastDate || !isSameDay(lastDate, msgDate)) {
      items.push({ type: 'separator', label: formatDateLabel(msgDate), key: `sep-${msgDate}` });
      lastDate = msgDate;
    }

    items.push({ type: 'message', msg, key: msg.messId || msg.id || `msg-${i}` });
  }

  return (
    <>
      {items.map((item) =>
        item.type === 'separator' ? (
          <div className="date-separator" key={item.key}>
            <span>{item.label}</span>
          </div>
        ) : (
          <MessageItem
            key={item.key}
            message={item.msg}
            currentUserId={currentUserId}
          />
        )
      )}
      <div ref={bottomRef} />
    </>
  );
}
