// CustomerInfoDisplay.tsx
import React from "react";
import { User, CustomerTier } from "./types";

// Define which fields should be visible to different user roles
const VISIBLE_FIELDS: Record<string, (keyof User)[]> = {
  // Only show necessary customer information (no internal IDs or sensitive data)
  default: [
    "displayName", 
    "email", 
    "phoneNumber",
    "tier"
  ],
  // More fields for detailed view
  detailed: [
    "displayName", 
    "email", 
    "phoneNumber",
    "streetAddress",
    "suburb",
    "townCity",
    "postcode",
    "country",
    "tier"
  ]
};

// Human-readable labels for each field
const LABELS: Record<keyof User, string> = {
  id: "ID",
  username: "Username",
  firstName: "First Name",
  lastName: "Last Name",
  displayName: "Display Name",
  email: "Email",
  phoneNumber: "Phone Number",
  streetAddress: "Street Address",
  suburb: "Suburb",
  townCity: "Town/City",
  postcode: "Postcode",
  country: "Country",
  avatarUrl: "Avatar",
  backgroundUrl: "Background",
  role: "Role",
  tier: "Membership Tier"
};

// Color scheme that works for colorblind users
// Using a blue/orange contrast that is distinguishable across most forms of color blindness
const TIER_COLORS = {
  [CustomerTier.BRONZE]: {
    background: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200"
  },
  [CustomerTier.SILVER]: {
    background: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200"
  },
  [CustomerTier.GOLD]: {
    background: "bg-purple-100",
    text: "text-purple-800", 
    border: "border-purple-200"
  },
  default: {
    background: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200"
  }
};

interface CustomerInfoDisplayProps {
  user: User;
  viewMode?: "default" | "detailed";
}

export default function CustomerInfoDisplay({ 
  user, 
  viewMode = "default" 
}: CustomerInfoDisplayProps) {
  // Determine which fields to display based on the view mode
  const visibleFields = VISIBLE_FIELDS[viewMode];
  
  // Get tier styling or default if tier isn't specified
  const tierStyle = user.tier ? TIER_COLORS[user.tier] : TIER_COLORS.default;

  return (
    <div className={`rounded-lg p-4 ${tierStyle.background} ${tierStyle.border} border`}>
      <h3 className={`text-lg font-semibold mb-4 text-center ${tierStyle.text}`}>
        Customer Information
      </h3>
      
      <dl className="divide-y divide-gray-200">
        {visibleFields.map((key) => 
          user[key] ? (
            <div className="py-2 flex justify-between" key={key}>
              <dt className="font-medium text-gray-700">{LABELS[key]}</dt>
              <dd className="text-gray-900">{user[key] as string}</dd>
            </div>
          ) : null
        )}
      </dl>
    </div>
  );
}

// Alternative tier-focused display component
interface CustomerTierDisplayProps {
  user: User;
}

export function CustomerTierDisplay({ user }: CustomerTierDisplayProps) {
  const tierStyle = user.tier ? TIER_COLORS[user.tier] : TIER_COLORS.default;
  const tierName = user.tier || "Not assigned";
  
  // Benefits based on tier
  const tierBenefits = {
    [CustomerTier.BRONZE]: [
      "Standard support",
      "Basic features",
      "Email notifications"
    ],
    [CustomerTier.SILVER]: [
      "Priority support",
      "Advanced features",
      "Phone and email notifications",
      "Monthly reports"
    ],
    [CustomerTier.GOLD]: [
      "24/7 dedicated support",
      "All features included",
      "Custom integrations",
      "Dedicated account manager",
      "Weekly reports"
    ],
    default: ["No specific benefits"]
  };
  
  const benefits = user.tier ? tierBenefits[user.tier] : tierBenefits.default;

  return (
    <div className={`rounded-lg p-4 ${tierStyle.background} ${tierStyle.border} border`}>
      <h3 className={`text-lg font-semibold text-center ${tierStyle.text}`}>
        {user.displayName} - {tierName} Tier
      </h3>
      
      <div className="mt-3">
        <p className={`font-medium ${tierStyle.text}`}>Membership Benefits:</p>
        <ul className="mt-2 space-y-1">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center">
              <span className={`mr-2 ${tierStyle.text}`}>•</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Contact: {user.email} {user.phoneNumber ? `| ${user.phoneNumber}` : ''}
        </p>
      </div>
    </div>
  );
}