//types.ts
export type EditMode = "view" | "edit";

export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
  SUPPORT = "support"
}

// types.ts
export enum CustomerTier {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM"
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  streetAddress?: string;
  suburb?: string;
  townCity?: string;
  postcode?: string;
  country?: string;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  role: string;
  tier?: CustomerTier;
}

// Types for the tier application
export type TierPackage = "SILVER" | "GOLD" | "PLATINUM";

export interface TierApplicationFormData {
  package: TierPackage;
}

export interface ProfileSectionProps {
  user: User;
  isCollapsed: boolean;
}