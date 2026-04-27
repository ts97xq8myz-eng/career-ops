export type LeadStatus =
  | "new"
  | "contacted"
  | "quoted"
  | "confirmed"
  | "cancelled"
  | "lost";

export interface UTMParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

export interface Lead {
  id?: string;
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
  selectedRate?: number;
  selectedFlightRedirect?: string;
  utm: UTMParams;
  status: LeadStatus;
  confirmationCode?: string;
  paymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  ipAddress?: string;
  userAgent?: string;
}
