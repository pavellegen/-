export interface Review {
  author: string;
  rating: number;
  text: string;
}

export interface CaseExample {
  title: string;
  description: string;
  sourceUrl?: string;
}

export interface VerificationInfo {
  lastName: string;
  series: string;
  number: string;
  issueDate: string; // ISO date string YYYY-MM-DD
}

export interface Lawyer {
  id: number;
  fullName: string;
  photoUrl: string;
  city: string;
  phone: string;
  primarySpecialization: string;
  categories: string[];
  otherSpecializations: string[];
  experienceYears: number;
  winRate: number;
  consultationsHeld: number;
  verificationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  verificationInfo?: VerificationInfo;
  rejectionReason?: string;
  bio: string;
  caseExamples: CaseExample[];
  reviews: Review[];
  registrationDate: Date;
  smsNotificationsEnabled: boolean;
  isPublished: boolean;
  balance: number;
  consultationPrice: number;
  offersFreeConsultation: boolean;
  freeConsultationConditions?: string;
}
