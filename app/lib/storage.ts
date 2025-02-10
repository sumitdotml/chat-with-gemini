import { Message } from "@/types";

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

const STORAGE_KEY = "chat-conversations";

export function saveConversation(conversation: Conversation) {
  const conversations = getConversations();
  conversations[conversation.id] = conversation;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function getConversations(): Record<string, Conversation> {
  if (typeof window === "undefined") return {};
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : {};
}

export function deleteConversation(id: string) {
  const conversations = getConversations();
  delete conversations[id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}
