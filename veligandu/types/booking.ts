import type { VillaCategory } from "./villa";
import type { MealPlan } from "./rate";

export interface BookingSearch {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  villaCategory?: VillaCategory;
  nationality?: string;
}

export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  nearestAirport: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  villaCategory: string;
  budget: string;
  message: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  selectedRate?: number;
  selectedFlightRedirect?: string;
  mealPlan?: MealPlan;
}

export interface ConfirmationData {
  leadId: string;
  confirmationCode: string;
  fullName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  villaCategory: string;
  createdAt: string;
}
