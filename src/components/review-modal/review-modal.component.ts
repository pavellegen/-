import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationService } from '../../services/consultation.service';
import { LawyerService } from '../../services/lawyer.service';
import { formatPhoneNumber } from '../../utils/phone-formatter';
import { ConsultationRequest } from '../../models/consultation.model';
import { Review } from '../../models/lawyer.model';

type FormState = 'enterPhone' | 'leaveReview' | 'submitted' | 'error';

@Component({
  selector: 'app-review-modal',
  templateUrl: './review-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ReviewModalComponent {
  lawyerId = input.required<number>();
  lawyerName = input.required<string>();
  close = output<void>();

  private consultationService = inject(ConsultationService);
  private lawyerService = inject(LawyerService);

  formState = signal<FormState>('enterPhone');
  phoneNumber = signal('+7');
  reviewText = signal('');
  rating = signal(0);
  hoveredRating = signal(0);
  error = signal<string | null>(null);
  
  private verifiedConsultation = signal<ConsultationRequest | null>(null);

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.phoneNumber.set(formatPhoneNumber(input.value));
  }

  verifyPhoneNumber() {
    this.error.set(null);
    const consultation = this.consultationService.findConductedConsultation(
      this.lawyerId(),
      this.phoneNumber()
    );

    if (consultation) {
      this.verifiedConsultation.set(consultation);
      this.formState.set('leaveReview');
    } else {
      this.error.set('Консультация с указанным номером телефона не найдена, либо по ней уже оставлен отзыв. Убедитесь, что юрист отметил консультацию как "проведенную".');
      this.formState.set('error');
    }
  }

  submitReview() {
    if (this.rating() === 0) {
      this.error.set('Пожалуйста, поставьте оценку.');
      return;
    }
    if (this.reviewText().trim().length < 10) {
       this.error.set('Пожалуйста, напишите отзыв длиной не менее 10 символов.');
      return;
    }

    const consultation = this.verifiedConsultation();
    if (!consultation) {
      this.error.set('Произошла ошибка. Попробуйте снова.');
      this.formState.set('error');
      return;
    }

    const anonymizedName = this.anonymizeName(consultation.clientName);
    const newReview: Review = {
      author: anonymizedName,
      rating: this.rating(),
      text: this.reviewText().trim(),
    };

    this.lawyerService.addReview(this.lawyerId(), newReview);
    this.consultationService.markReviewAsLeft(consultation.id);

    this.formState.set('submitted');
  }

  setRating(rate: number) {
    this.rating.set(rate);
    this.error.set(null); // Clear rating error if user clicks
  }
  
  anonymizeName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1].charAt(0)}.`;
    }
    return fullName;
  }
  
  onClose() {
    this.close.emit();
  }
}
