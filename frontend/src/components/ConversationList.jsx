import ConversationItem from './ConversationItem.jsx';

export default function ConversationList({
  conversations,
  selectedId,
  onSelectConversation,
  loading,
  currentUserId,
}) {
  return (
    <div className="chat-sidebar" style={{ width: '100%' }}>
      <div className="sidebar-header">
        <span className="sidebar-header__title">Messages</span>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          {conversations.length > 0 ? `${conversations.length} conversations` : ''}
        </span>
      </div>

      <div className="sidebar-list">
        {loading && (
          <div className="state-center" style={{ padding: '32px 0' }}>
            <div className="spinner" />
            <span>Loading...</span>
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="state-center" style={{ padding: '40px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>User</div>
            <span>No conversations yet</span>
          </div>
        )}

        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            currentUserId={currentUserId}
            selected={Number(conversation.id) === Number(selectedId)}
            onClick={() => onSelectConversation(conversation.id)}
          />
        ))}
      </div>
    </div>
  );
}
