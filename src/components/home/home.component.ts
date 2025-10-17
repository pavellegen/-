import { Component, ChangeDetectionStrategy, output, signal, inject, input, computed } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LawyerLoginModalComponent } from '../lawyer-login-modal/lawyer-login-modal.component';
import { Lawyer } from '../../models/lawyer.model';
import { ConsultationService } from '../../services/consultation.service';

interface Category {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LawyerLoginModalComponent]
})
export class HomeComponent {
  loggedInLawyer = input<Lawyer | null>(null);
  categorySelected = output<string>();
  registrationStarted = output<string>();
  loginRequest = output<Lawyer>();
  goToProfile = output<void>();
  continueRegistration = output<void>();

  private consultationService = inject(ConsultationService);
  isLoginModalOpen = signal(false);
  
  isRegistrationInProgress = computed(() => this.loggedInLawyer() && !this.loggedInLawyer()!.fullName);
  
  newRequestCount = computed(() => {
    const lawyer = this.loggedInLawyer();
    if (!lawyer) return 0;
    return this.consultationService.getNewRequestsForLawyer(lawyer.id).length;
  });

  // Injected DomSanitizer to safely use [innerHTML] for SVG icons
  sanitizer = inject(DomSanitizer);

  categories: Category[] = [
    { name: 'Семейное право', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.14-4.122a5.132 5.132 0 0 1 7.14 0A5.132 5.132 0 0 1 12 19.08a5.132 5.132 0 0 1-7.14 0A5.132 5.132 0 0 1 12 11.88z" />' },
    { name: 'Недвижимость', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.545M3 4.5l7.5 4.5-7.5 4.5" />' },
    { name: 'Бизнес-споры', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />' },
    { name: 'Уголовное право', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />' },
    { name: 'Трудовое право', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V8.25a2.25 2.25 0 0 0-2.25-2.25H16.5m-13.5 0h13.5m-13.5 0V6a2.25 2.25 0 0 1 2.25-2.25h9a2.25 2.25 0 0 1 2.25 2.25v2.25" />' },
    { name: 'Наследство', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />' },
    { name: 'Защита потребителей', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Z" />' },
    { name: 'Автомобильное право', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-1.025H9.623c-.696 0-1.343.305-1.787.825l-4.244 4.243a.875.875 0 0 0 0 1.238l4.244 4.243a.875.875 0 0 0 1.238 0l1.244-1.244M12 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3 0H6.75" />' },
    { name: 'Интеллектуальная собственность', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.355a7.5 7.5 0 0 1-7.5 0c-1.272 0-2.492.206-3.634.602a8.048 8.048 0 0 1 14.768 0c-1.142-.396-2.362-.602-3.634-.602ZM12 6.75a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Z" />' }
  ];

  onSelectCategory(categoryName: string) {
    this.categorySelected.emit(categoryName);
  }

  handleRegistration(phone: string) {
    this.isLoginModalOpen.set(false);
    this.registrationStarted.emit(phone);
  }
}
