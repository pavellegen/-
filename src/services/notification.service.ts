import { Injectable, inject } from '@angular/core';
import { LawyerService } from './lawyer.service.ts';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private lawyerService = inject(LawyerService);
  private notifiedLawyerIds = new Set<number>();

  checkAndNotifyLawyers(): void {
    const lawyers = this.lawyerService.getLawyers()();
    const now = new Date();
    const twoDaysInMs = 48 * 60 * 60 * 1000;

    console.log('Checking for lawyers to notify...');
    for (const lawyer of lawyers) {
      // Skip if already notified in this session
      if (this.notifiedLawyerIds.has(lawyer.id)) {
        continue;
      }
      
      const registrationDate = new Date(lawyer.registrationDate);
      const timeSinceRegistration = now.getTime() - registrationDate.getTime();

      if (lawyer.caseExamples.length === 0 && timeSinceRegistration > twoDaysInMs) {
        // In a real app, this would call an SMS gateway API.
        // The link would be a deep link to the profile edit page.
        const profileLink = `${window.location.origin}${window.location.pathname}`; 
        
        console.log(`
          --- SIMULATING SMS ---
          To: ${lawyer.phone}
          Lawyer: ${lawyer.fullName}
          Message: Заполните кейсы, чтобы стать привлекательнее: ${profileLink}
          ----------------------
        `);
        // Add to notified set to avoid sending multiple times in one app session
        this.notifiedLawyerIds.add(lawyer.id);
      }
    }
  }
}
