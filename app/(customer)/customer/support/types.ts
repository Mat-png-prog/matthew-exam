export interface SupportMessageInput {
  title: string;
  message: string;
}
export interface SupportMessageEntry {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}