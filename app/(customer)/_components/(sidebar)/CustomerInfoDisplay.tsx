// CustomerInfoDisplay.tsx
import React from "react";
import { User, CustomerTier } from "./types";
import { Badge } from "@/components/ui/badge";
import { Medal } from "lucide-react";

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

// Updated color scheme that works for colorblind users
const TIER_COLORS = {
  [CustomerTier.BRONZE]: {
    background: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "text-amber-600"
  },
  [CustomerTier.SILVER]: {
    background: "bg-gray-100",
    text: "text-gray-600", 
    border: "border-gray-200",
    icon: "text-gray-500"
  },
  [CustomerTier.GOLD]: {
    background: "bg-yellow-100",
    text: "text-yellow-600", 
    border: "border-yellow-200",
    icon: "text-yellow-500"
  },
  [CustomerTier.PLATINUM]: {
    background: "bg-blue-100",
    text: "text-blue-700", 
    border: "border-blue-200",
    icon: "text-blue-600"
  },
  default: {
    background: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
    icon: "text-gray-400"
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
  // Get tier styling or default if tier isn't specified
  const tierStyle = user.tier ? TIER_COLORS[user.tier] : TIER_COLORS.default;
  
  // Filter out any undefined fields from the user
  const userEntries = Object.entries(user).filter(([_, value]) => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <div className={`rounded-lg p-4 ${tierStyle.border} border`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Customer Information
        </h3>
        {user.tier && (
          <div className="flex items-center gap-1">
            <Medal className={`h-4 w-4 ${tierStyle.icon}`} />
            <Badge variant="outline" className={`${tierStyle.background} ${tierStyle.text}`}>
              {user.tier} Tier
            </Badge>
          </div>
        )}
      </div>
      
      <dl className="divide-y divide-gray-200 space-y-1">
        {userEntries.map(([key, value]) => {
          // Skip certain fields
          if (['avatarUrl', 'backgroundUrl', 'id', 'role'].includes(key)) {
            return null;
          }

          return (
            <div className="py-2 flex justify-between" key={key}>
              <dt className="font-medium text-gray-700">{LABELS[key as keyof User] || key}</dt>
              <dd className="text-gray-900">
                {key === 'tier' ? `${value} Tier` : value as string}
              </dd>
            </div>
          );
        })}
      </dl>

      {user.tier && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <TierBenefits tier={user.tier} />
        </div>
      )}
    </div>
  );
}

// Tier benefits component
interface TierBenefitsProps {
  tier: CustomerTier;
}

function TierBenefits({ tier }: TierBenefitsProps) {
  const tierStyle = TIER_COLORS[tier];
  
  // Benefits based on tier - aligned with other components
  const tierBenefits = {
    [CustomerTier.BRONZE]: [
      "Standard shopping experience",
      "Access to regular promotions",
      "Regular customer support"
    ],
    [CustomerTier.SILVER]: [
      "Early access to sales",
      "5% discount on all purchases",
      "Free standard shipping",
      "Priority customer support"
    ],
    [CustomerTier.GOLD]: [
      "10% discount on all purchases",
      "Free express shipping",
      "Exclusive access to limited editions",
      "VIP customer support",
      "First access to new collections"
    ],
    [CustomerTier.PLATINUM]: [
      "15% discount on all purchases",
      "Dedicated personal shopper",
      "VIP events and pre-releases",
      "Free returns and exchanges",
      "Complimentary gift wrapping",
      "Exclusive platinum-only products"
    ]
  };
  
  const benefits = tierBenefits[tier];

  return (
    <div>
      <p className={`font-medium ${tierStyle.text} mb-2`}>Membership Benefits:</p>
      <ul className="space-y-1">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center">
            <span className={`mr-2 ${tierStyle.text}`}>✓</span>
            <span className="text-sm">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}