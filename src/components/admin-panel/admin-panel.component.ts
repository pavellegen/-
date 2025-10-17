import { Component, ChangeDetectionStrategy, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LawyerService } from '../../services/lawyer.service';
import { Lawyer } from '../../models/lawyer.model';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class AdminPanelComponent {
  private lawyerService = inject(LawyerService);

  lawyers = this.lawyerService.getLawyers();
  
  home = output<void>();
  editLawyer = output<Lawyer>();
  deleteLawyer = output<number>();

  // Modal state
  isVerificationModalOpen = signal(false);
  lawyerToVerify = signal<Lawyer | null>(null);
  rejectionReason = signal('');
  isRejectionInputVisible = signal(false);


  onDelete(id: number) {
    if (confirm('Вы уверены, что хотите удалить этого юриста? Это действие нельзя отменить.')) {
      this.deleteLawyer.emit(id);
    }
  }

  openVerificationModal(lawyer: Lawyer) {
    this.lawyerToVerify.set(lawyer);
    this.isVerificationModalOpen.set(true);
    this.isRejectionInputVisible.set(false);
    this.rejectionReason.set('');
  }

  closeVerificationModal() {
    this.isVerificationModalOpen.set(false);
    this.lawyerToVerify.set(null);
  }

  approveVerification() {
    const lawyer = this.lawyerToVerify();
    if (!lawyer) return;
    this.lawyerService.updateVerificationStatus(lawyer.id, 'approved');
    this.closeVerificationModal();
  }

  rejectVerification() {
    const lawyer = this.lawyerToVerify();
    const reason = this.rejectionReason().trim();
    if (!lawyer || !reason) return;
    this.lawyerService.updateVerificationStatus(lawyer.id, 'rejected', reason);
    this.closeVerificationModal();
  }
}
