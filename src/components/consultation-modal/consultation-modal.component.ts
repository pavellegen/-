import { Component, ChangeDetectionStrategy, input, output, signal, inject, computed, effect } from '@angular/core';
import { ConsultationService } from '../../services/consultation.service.ts';
import { formatPhoneNumber, normalizePhoneNumber } from '../../utils/phone-formatter.ts';

type FormState = 'editing' | 'verifying' | 'paying' | 'processing' | 'submitted' | 'error';

@Component({
  selector: 'app-consultation-modal',
  templateUrl: './consultation-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultationModalComponent {
  lawyerId = input.required<number>();
  lawyerName = input.required<string>();
  consultationPrice = input.required<number>();
  offersFreeConsultation = input.required<boolean>();
  freeConsultationConditions = input<string | undefined>();

  close = output<void>();

  private consultationService = inject(ConsultationService);

  formState = signal<FormState>('editing');
  consultationType = signal<'free' | 'paid'>('free');

  // Form fields as signals
  clientName = signal('');
  clientContact = signal('');
  situation = signal('');
  consultationDate = signal('');
  consultationTime = signal('');
  verificationCode = signal('');
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (!this.offersFreeConsultation()) {
        this.consultationType.set('paid');
      }
    });
  }
  
  fullConsultationDateTime = computed(() => {
    const date = this.consultationDate();
    const time = this.consultationTime();
    if (date && time) {
        return new Date(`${date}T${time}`);
    }
    return null;
  });

  isFormValid = computed(() => {
    const normalized = normalizePhoneNumber(this.clientContact());
    return this.clientName().trim() !== '' && !!normalized && normalized.length === 11 && this.consultationDate() !== '' && this.consultationTime() !== '';
  });

  minDate = computed(() => {
    return new Date().toISOString().split('T')[0];
  });

  minTime = computed(() => {
    const selected = this.consultationDate();
    const today = this.minDate();
    if (selected === today) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    return ''; // No min time for future dates
  });

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = formatPhoneNumber(input.value);
    this.clientContact.set(formatted);
  }

  getVerificationCode() {
    this.error.set(null);
    if (!this.isFormValid()) {
        this.error.set('Пожалуйста, заполните все обязательные поля корректно.');
        return;
    }
    // Simulate sending SMS code
    console.log(`Simulating sending SMS code to ${this.clientContact()}`);
    this.formState.set('verifying');
  }

  onVerify() {
    this.error.set(null);
    if (this.verificationCode().length !== 4 || !/^\d{4}$/.test(this.verificationCode())) {
      this.error.set('Код подтверждения должен состоять из 4 цифр.');
      return;
    }

    if (this.consultationType() === 'paid') {
      this.formState.set('paying');
    } else {
      this.addConsultationRequest();
      this.formState.set('submitted');
    }
  }

  handlePayment() {
    this.formState.set('processing');
    setTimeout(() => {
      this.addConsultationRequest();
      this.formState.set('submitted');
    }, 2000);
  }

  private addConsultationRequest() {
     this.consultationService.addRequest({
        lawyerId: this.lawyerId(),
        clientName: this.clientName(),
        clientContact: normalizePhoneNumber(this.clientContact()),
        description: this.situation(),
        type: this.consultationType(),
        consultationDateTime: this.fullConsultationDateTime(),
    });
  }

  changePhoneNumber() {
    this.formState.set('editing');
    this.verificationCode.set('');
    this.error.set(null);
  }

  onClose() {
    this.close.emit();
  }
}
