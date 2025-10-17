import { Component, ChangeDetectionStrategy, input, output, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lawyer, Review, CaseExample, VerificationInfo } from '../../models/lawyer.model';
import { ConsultationModalComponent } from '../consultation-modal/consultation-modal.component';
import { LawyerService } from '../../services/lawyer.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConsultationService } from '../../services/consultation.service';
import { FavoriteLawyerService } from '../../services/favorite.service';
import { ReviewModalComponent } from '../review-modal/review-modal.component';

@Component({
  selector: 'app-lawyer-profile',
  templateUrl: './lawyer-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConsultationModalComponent, ReviewModalComponent, ReactiveFormsModule, CommonModule]
})
export class LawyerProfileComponent {
  lawyerId = input.required<number>();
  isOwner = input<boolean>(false);
  back = output<void>();
  edit = output<void>();

  private lawyerService = inject(LawyerService);
  private consultationService = inject(ConsultationService);
  favoriteService = inject(FavoriteLawyerService);

  lawyer = computed(() => this.lawyerService.getLawyerById(this.lawyerId()));

  isFavorite = computed(() => {
    const lawyer = this.lawyer();
    if (!lawyer) return false;
    return this.favoriteService.getFavoriteIds()().includes(lawyer.id);
  });

  newConsultationRequests = computed(() => {
    if (!this.isOwner()) return [];
    return this.consultationService.getNewRequestsForLawyer(this.lawyerId());
  });

  isModalOpen = signal(false);
  isReviewModalOpen = signal(false);
  isManagingCases = signal(false);
  editingCaseIndex = signal<number | null>(null);
  showConsultationDetails = signal(false);

  // Signals for delete confirmation modal
  isConfirmDeleteModalOpen = signal(false);
  caseIndexToDelete = signal<number | null>(null);

  isVerificationFormVisible = signal(false);
  
  // Case Examples Pagination
  caseExamplesPageSize = 1;
  currentCaseExamplesPage = signal(1);

  private lawyerChangeEffect = effect(() => {
    // When the lawyer being viewed changes, reset the case page to the first one.
    this.lawyer();
    this.currentCaseExamplesPage.set(1);
  });

  totalCaseExamplesPages = computed(() => {
    const lawyer = this.lawyer();
    if (!lawyer) return 0;
    return Math.ceil(lawyer.caseExamples.length / this.caseExamplesPageSize);
  });

  paginatedCaseExamples = computed(() => {
    const lawyer = this.lawyer();
    if (!lawyer) return [];
    const page = this.currentCaseExamplesPage();
    const start = (page - 1) * this.caseExamplesPageSize;
    const end = start + this.caseExamplesPageSize;
    return lawyer.caseExamples.slice(start, end);
  });

  verificationForm = new FormGroup({
    lastName: new FormControl('', Validators.required),
    series: new FormControl('', Validators.required),
    number: new FormControl('', Validators.required),
    issueDate: new FormControl('', Validators.required),
  });

  caseForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    sourceUrl: new FormControl('', [Validators.pattern('https?://.+')])
  });

  onBack() {
    this.back.emit();
  }

  onEdit() {
    this.edit.emit();
  }

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  openReviewModal() {
    this.isReviewModalOpen.set(true);
  }

  closeReviewModal() {
    this.isReviewModalOpen.set(false);
  }

  calculateAverageRating(reviews: Review[]): string {
    if (!reviews || reviews.length === 0) {
      return '—';
    }
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }

  getConsultationNoun(count: number): string {
    const cases = [2, 0, 1, 1, 1, 2];
    const titles = ['консультация', 'консультации', 'консультаций'];
    const index = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[(count % 10 < 5) ? count % 10 : 5];
    return titles[index];
  }

  toggleCaseManagement() {
    this.isManagingCases.update(v => !v);
    this.caseForm.reset();
    this.editingCaseIndex.set(null);
  }

  startEditCase(index: number, caseEx: CaseExample) {
    this.editingCaseIndex.set(index);
    this.caseForm.setValue({
      title: caseEx.title,
      description: caseEx.description,
      sourceUrl: caseEx.sourceUrl || ''
    });
    this.caseForm.markAsPristine();
  }
  
  cancelEdit() {
    this.caseForm.reset();
    this.editingCaseIndex.set(null);
  }

  saveCase() {
    if (this.caseForm.invalid) {
      this.caseForm.markAllAsTouched();
      return;
    }
    
    const currentLawyer = this.lawyer();
    if (!currentLawyer) return;

    const formValue = this.caseForm.value;
    const caseData: CaseExample = {
      title: formValue.title!,
      description: formValue.description!,
      sourceUrl: formValue.sourceUrl || undefined
    };

    const editIndex = this.editingCaseIndex();
    
    // Delegate the update logic to the service
    this.lawyerService.addOrUpdateCaseExample(currentLawyer.id, caseData, editIndex);

    this.caseForm.reset();
    this.editingCaseIndex.set(null);
  }

  // Opens the confirmation modal before deleting a case
  deleteCase(indexToDelete: number) {
    this.caseIndexToDelete.set(indexToDelete);
    this.isConfirmDeleteModalOpen.set(true);
  }
  
  // Actually performs the deletion after user confirmation
  confirmDelete() {
    const index = this.caseIndexToDelete();
    if (index === null) {
      this.cancelDelete();
      return;
    }

    const currentLawyer = this.lawyer();
    if (!currentLawyer) {
      this.cancelDelete();
      return;
    }
    
    this.lawyerService.deleteCaseExample(currentLawyer.id, index);
    
    // If the deleted case was the last one on the last page, go back a page.
    if (this.currentCaseExamplesPage() > 1 && this.currentCaseExamplesPage() > this.totalCaseExamplesPages()) {
      this.prevCasePage();
    }

    this.cancelEdit(); // Reset form in case the deleted item was being edited
    this.cancelDelete(); // Close modal and reset state
  }

  // Closes the confirmation modal
  cancelDelete() {
    this.isConfirmDeleteModalOpen.set(false);
    this.caseIndexToDelete.set(null);
  }

  updateConsultationStatus(requestId: number, status: 'conducted' | 'cancelled') {
    this.consultationService.updateRequestStatus(requestId, status);
  }

  toggleConsultationDetails() {
    this.showConsultationDetails.update(v => !v);
  }

  toggleSmsNotifications() {
    const currentLawyer = this.lawyer();
    if (!currentLawyer) return;

    const updatedLawyer = { ...currentLawyer, smsNotificationsEnabled: !currentLawyer.smsNotificationsEnabled };
    this.lawyerService.updateLawyer(updatedLawyer);
  }

  submitVerification() {
    if (this.verificationForm.invalid) {
      this.verificationForm.markAllAsTouched();
      return;
    }
    const currentLawyer = this.lawyer();
    if (!currentLawyer) return;

    const info: VerificationInfo = {
        lastName: this.verificationForm.value.lastName!,
        series: this.verificationForm.value.series!,
        number: this.verificationForm.value.number!,
        issueDate: this.verificationForm.value.issueDate!,
    };

    this.lawyerService.submitForVerification(currentLawyer.id, info);
    this.isVerificationFormVisible.set(false);
    this.verificationForm.reset();
  }

  formatTimeUntilConsultation(date: Date | null): string {
    if (!date) return '';

    const now = new Date();
    const consultationDate = new Date(date);
    const diffMs = consultationDate.getTime() - now.getTime();
    
    if (diffMs < 0) {
      // Past date
      return consultationDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
             consultationDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const minutes = diffMins % 60;
    const hours = diffHours % 24;
    
    if (diffDays > 0) {
      return `Через ${diffDays} д ${hours} ч`;
    }
    if (diffHours > 0) {
      return `Через ${diffHours} ч ${minutes} мин`;
    }
    if (diffMins > 0) {
       return `Через ${diffMins} мин`;
    }
    return 'Меньше минуты';
  }
  
  // Pagination methods
  goToCasePage(page: number) {
    if (page >= 1 && page <= this.totalCaseExamplesPages()) {
        this.currentCaseExamplesPage.set(page);
    }
  }

  nextCasePage() {
    this.goToCasePage(this.currentCaseExamplesPage() + 1);
  }

  prevCasePage() {
    this.goToCasePage(this.currentCaseExamplesPage() - 1);
  }
}