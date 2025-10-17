import { Component, ChangeDetectionStrategy, output, signal, inject } from '@angular/core';
import { LawyerService } from '../../services/lawyer.service.ts';
import { Lawyer } from '../../models/lawyer.model.ts';
import { formatPhoneNumber, normalizePhoneNumber } from '../../utils/phone-formatter.ts';

@Component({
  selector: 'app-lawyer-login-modal',
  templateUrl: './lawyer-login-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LawyerLoginModalComponent {
  private lawyerService = inject(LawyerService);

  close = output<void>();
  registered = output<string>();
  loginSuccess = output<Lawyer>();

  formStep = signal<'enterPhone' | 'enterCode'>('enterPhone');
  phoneNumber = signal('+7');
  verificationCode = signal('');
  error = signal<string | null>(null);

  onClose() {
    this.close.emit();
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = formatPhoneNumber(input.value);
    this.phoneNumber.set(formatted);
  }

  getVerificationCode() {
    this.error.set(null);
    const normalized = normalizePhoneNumber(this.phoneNumber());
    if (normalized && normalized.length === 11) {
      this.formStep.set('enterCode');
    } else {
      this.error.set('Пожалуйста, введите корректный 11-значный номер телефона.');
    }
  }

  onLogin() {
    this.error.set(null);
    if (this.verificationCode().length === 4 && /^\d{4}$/.test(this.verificationCode())) {
      const normalizedPhone = normalizePhoneNumber(this.phoneNumber());
      const existingLawyer = this.lawyerService.getLawyerByPhone(normalizedPhone);
      if (existingLawyer) {
        this.loginSuccess.emit(existingLawyer);
      } else {
        this.registered.emit(normalizedPhone); // Triggers new lawyer registration flow
      }
    } else {
      this.error.set('Код подтверждения должен состоять из 4 цифр.');
    }
  }
  
  changePhoneNumber() {
      this.formStep.set('enterPhone');
      this.verificationCode.set('');
      this.error.set(null);
  }
}
