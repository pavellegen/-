export interface ConsultationRequest {
  id: number;
  lawyerId: number;
  clientName: string;
  clientContact: string;
  description: string;
  type: 'free' | 'paid';
  status: 'new' | 'conducted' | 'cancelled';
  createdAt: Date;
  consultationDateTime: Date | null;
  reminderSent: boolean;
  reviewLeft: boolean;
}
