import { getAvatarFallback, getResolvedAvatarUrl } from './avatar.js';

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function getUserDisplayName(user) {
  return normalizeText(user?.displayName) || normalizeText(user?.username);
}

export function isPrivateConversation(conversation) {
  return conversation?.type === 'PRIVATE';
}

export function getPrivateConversationMember(conversation, currentUserId) {
  if (!conversation?.members?.length) {
    return null;
  }

  return (
    conversation.members.find((member) => Number(member.userId) !== Number(currentUserId)) || null
  );
}

export function getConversationDisplayName(conversation, currentUserId) {
  if (!conversation) {
    return 'Select a conversation';
  }

  if (!isPrivateConversation(conversation)) {
    return normalizeText(conversation.name) || 'Group chat';
  }

  const otherMember = getPrivateConversationMember(conversation, currentUserId);
  return (
    getUserDisplayName(otherMember) ||
    normalizeText(conversation.name) ||
    'Private conversation'
  );
}

export function getConversationAvatarUrl(conversation, currentUserId) {
  if (!conversation) return '';
  if (!isPrivateConversation(conversation)) {
    return normalizeText(conversation.image);
  }
  
  const otherMember = getPrivateConversationMember(conversation, currentUserId);
  return normalizeText(otherMember?.avatarUrl);
}

export function getConversationAvatarFallback(conversation, currentUserId) {
  return getAvatarFallback(getConversationDisplayName(conversation, currentUserId));
}

export function isConversationOnline(conversation, currentUserId) {
  if (!isPrivateConversation(conversation)) {
    return false;
  }

  return Boolean(getPrivateConversationMember(conversation, currentUserId)?.online);
}

export function getConversationStatusText(conversation, currentUserId) {
  if (!conversation) {
    return '';
  }

  if (!isPrivateConversation(conversation)) {
    const memberCount = conversation.members?.length || 0;
    return memberCount > 0 ? `${memberCount} members` : 'Group chat';
  }

  return isConversationOnline(conversation, currentUserId)
    ? 'Active now'
    : 'Inactive';
}

export function getConversationMetaText(conversation, currentUserId) {
  if (!conversation) {
    return '';
  }

  if (!isPrivateConversation(conversation)) {
    return normalizeText(conversation.lastMessage) || 'Start the conversation';
  }

  const otherMember = getPrivateConversationMember(conversation, currentUserId);
  const username = normalizeText(otherMember?.username);
  return username ? `@${username}` : 'Private conversation';
}

export function getConversationPreviewText(conversation, currentUserId) {
  const lastMessage = normalizeText(conversation?.lastMessage);
  if (lastMessage) {
    return lastMessage;
  }

  if (isPrivateConversation(conversation)) {
    return getConversationStatusText(conversation, currentUserId);
  }

  return 'No messages yet';
}
