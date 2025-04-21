//app/(customer)/customer/settings/types.ts

export interface OrderData {
  id: string;
  Branch: string;
  methodOfCollection: string;
  salesRep: string;
  referenceNumber: string;
  firstName: string;
  lastName: string;
  companyName: string;
  countryRegion: string;
  streetAddress: string;
  apartmentSuite: string;
  townCity: string;
  province: string;
  postcode: string;
  phone: string;
  email: string;
  orderNotes: string;
  agreeTerms: boolean;
  receiveEmailReviews: boolean;
}

export interface OrderUpdateFormValues {
  Branch: string;
  methodOfCollection: string;
  salesRep: string;
  referenceNumber: string;
  firstName: string;
  lastName: string;
  companyName: string;
  countryRegion: string;
  streetAddress: string;
  apartmentSuite: string;
  townCity: string;
  province: string;
  postcode: string;
  phone: string;
  email: string;
  orderNotes: string;
  agreeTerms: boolean;
  receiveEmailReviews: boolean;
}