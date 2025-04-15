export type EditMode = "view" | "edit";

// types.ts
export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
  SUPPORT = "support"
}

export enum CustomerTier {
  BRONZE="bronze",
  SILVER="silver",
  GOLD="gold"
}

export interface User {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  streetAddress?: string;
  suburb?: string | null;
  townCity?: string;
  postcode?: string;
  country?: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  role?: string;
}

export interface ProfileSectionProps {
  user: User;
  isCollapsed: boolean;
}