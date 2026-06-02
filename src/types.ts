export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  orgCode: string; // The active organization code
  avatar?: string;
  bio?: string;
  phone?: string;
  jobTitle?: string;
  isPremium: boolean;
  paymentStatus: "free" | "paid" | "pending";
  createdat: string;
  updatedAt: string;
}

export interface Organization {
  id: string; // usually same as orgCode or auto-id
  orgCode: string; // e.g., ORG-123456
  name: string;
  ownerId: string;
  members: string[]; // member userIds
  createdat: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  category: "development" | "design" | "testing" | "documentation";
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  createdBy: string;
  dueDate: string; // YYYY-MM-DD
  orgId: string; // matches organization orgCode or owner info
  createdat: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  endTime: string; // HH:mm
  type: "meeting" | "deadline" | "review" | "other";
  priority: "low" | "medium" | "high";
  createdBy: string;
  attendees: string[]; // member userIds
  orgId: string;
  createdat: string;
  updatedAt: string;
}

export interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: number; // millisecond timestamp
}

export interface MessageChannel {
  id: string; // conversationId between 2 users
  participants: string[]; // [uid1, uid2]
  orgId: string;
  messages: ChatMessage[];
  createdat: string;
  updatedAt: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  type: "task" | "message" | "event" | "org";
  read: boolean;
  createdat: string;
}
