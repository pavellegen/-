import { Injectable, signal, inject } from '@angular/core';
import { ConsultationRequest } from '../models/consultation.model.ts';
import { LawyerService } from './lawyer.service.ts';
import { normalizePhoneNumber } from '../utils/phone-formatter.ts';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private storageKey = 'consultationRequests';
  private requests = signal<ConsultationRequest[]>(this.loadFromStorage());
  private nextId = signal(this.calculateNextId());
  private lawyerService = inject(LawyerService);

  getNewRequestsForLawyer(lawyerId: number) {
    return this.requests().filter(r => r.lawyerId === lawyerId && r.status === 'new');
  }

  addRequest(requestData: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt' | 'reminderSent' | 'reviewLeft'>) {
    const newRequest: ConsultationRequest = {
      ...requestData,
      id: this.nextId(),
      status: 'new',
      createdAt: new Date(),
      reminderSent: false,
      reviewLeft: false,
    };
    this.requests.update(reqs => [...reqs, newRequest]);
    this.nextId.update(id => id + 1);
    this.saveToStorage();
    console.log('New consultation request added:', newRequest);

    // Simulate SMS notification if enabled
    const lawyer = this.lawyerService.getLawyerById(requestData.lawyerId);
    if (lawyer && lawyer.smsNotificationsEnabled) {
      console.log(`
        --- SIMULATING SMS CONFIRMATION ---
        To: ${lawyer.phone}
        Message: Новый запрос на консультацию от клиента ${requestData.clientName}. Проверьте свой профиль.
        ----------------------
      `);
    }

    console.log(`
        --- SIMULATING SMS CONFIRMATION ---
        To: ${requestData.clientContact}
        Message: Ваш запрос на консультацию с юристом ${lawyer?.fullName} отправлен. Юрист свяжется с вами для подтверждения времени.
        ----------------------
      `);
  }
  
  updateRequestStatus(requestId: number, status: 'conducted' | 'cancelled') {
    let lawyerToUpdateId: number | null = null;

    this.requests.update(reqs =>
      reqs.map(r => {
        if (r.id === requestId) {
          // Check if status is changing to 'conducted' to avoid incrementing multiple times
          if (status === 'conducted' && r.status !== 'conducted') {
            lawyerToUpdateId = r.lawyerId;
          }
          return { ...r, status: status };
        }
        return r;
      })
    );

    if (lawyerToUpdateId !== null) {
      const lawyer = this.lawyerService.getLawyerById(lawyerToUpdateId);
      if (lawyer) {
        const updatedLawyer = { ...lawyer, consultationsHeld: lawyer.consultationsHeld + 1 };
        this.lawyerService.updateLawyer(updatedLawyer);
      }
    }

    this.saveToStorage();
  }

  checkReminders(): void {
    const now = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000;
    const oneMinuteInMs = 60 * 1000;
    
    // Check for consultations where the reminder should be sent in a window
    // between 59 and 61 minutes from now, to avoid missing it if the task runs slightly off-schedule.
    const reminderWindowStart = oneHourInMs - oneMinuteInMs; // 59 mins
    const reminderWindowEnd = oneHourInMs + oneMinuteInMs;   // 61 mins

    let needsSave = false;
    const updatedRequests = this.requests().map(request => {
      if (
        request.status === 'new' &&
        !request.reminderSent &&
        request.consultationDateTime
      ) {
        const consultationTime = new Date(request.consultationDateTime).getTime();
        const timeUntilConsultation = consultationTime - now;

        if (timeUntilConsultation > reminderWindowStart && timeUntilConsultation < reminderWindowEnd) {
          const lawyer = this.lawyerService.getLawyerById(request.lawyerId);
          if (lawyer) {
            console.log(`
              --- SIMULATING SMS REMINDER ---
              To Lawyer: ${lawyer.phone}
              Message: Напоминание: у вас консультация с клиентом ${request.clientName} через час.
              -------------------------------
            `);
             console.log(`
              --- SIMULATING SMS REMINDER ---
              To Client: ${request.clientContact}
              Message: Напоминание: у вас консультация с юристом ${lawyer.fullName} через час.
              -------------------------------
            `);
          }
          
          needsSave = true;
          return { ...request, reminderSent: true };
        }
      }
      return request;
    });

    if (needsSave) {
      this.requests.set(updatedRequests);
      this.saveToStorage();
      console.log('Sent consultation reminders and updated storage.');
    }
  }

  findConductedConsultation(lawyerId: number, clientContact: string): ConsultationRequest | undefined {
    const normalizedPhone = normalizePhoneNumber(clientContact);
    if (!normalizedPhone) return undefined;

    return this.requests().find(
      r =>
        r.lawyerId === lawyerId &&
        normalizePhoneNumber(r.clientContact) === normalizedPhone &&
        r.status === 'conducted' &&
        !r.reviewLeft
    );
  }

  markReviewAsLeft(requestId: number) {
    this.requests.update(reqs =>
      reqs.map(r => (r.id === requestId ? { ...r, reviewLeft: true } : r))
    );
    this.saveToStorage();
  }

  private loadFromStorage(): ConsultationRequest[] {
    try {
      if (typeof sessionStorage === 'undefined') return [];
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) {
        // Revive dates and add status for old data for backward compatibility
        return JSON.parse(stored).map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          consultationDateTime: r.consultationDateTime ? new Date(r.consultationDateTime) : null,
          status: r.status || (r.isNew ? 'new' : 'conducted'),
          reminderSent: r.reminderSent || false,
          reviewLeft: r.reviewLeft || false
        }));
      }
      return [];
    } catch (e) {
      console.error('Error loading consultation requests from storage', e);
      return [];
    }
  }

  private saveToStorage() {
     if (typeof sessionStorage === 'undefined') return;
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(this.requests()));
    } catch(e) {
      console.error('Error saving consultation requests to storage', e);
    }
  }

  private calculateNextId(): number {
    const reqs = this.requests();
    return reqs.length > 0 ? Math.max(...reqs.map(r => r.id)) + 1 : 1;
  }
}
