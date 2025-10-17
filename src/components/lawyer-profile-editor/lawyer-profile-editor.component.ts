import { Component, ChangeDetectionStrategy, output, signal, input, effect, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Lawyer } from '../../models/lawyer.model';
import { formatPhoneNumber, normalizePhoneNumber } from '../../utils/phone-formatter';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

type LawyerFormData = Omit<Lawyer, 'id' | 'reviews' | 'caseExamples' | 'consultationsHeld' | 'winRate' | 'registrationDate' | 'smsNotificationsEnabled' | 'verificationStatus' | 'rejectionReason' | 'verificationInfo' | 'isPublished' | 'balance'>;
type View = 'home' | 'list' | 'profile' | 'profileEditor' | 'admin';

@Component({
  selector: 'app-lawyer-profile-editor',
  templateUrl: './lawyer-profile-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule]
})
export class LawyerProfileEditorComponent implements OnDestroy {
  lawyer = input<Lawyer | null>(null);
  cameFrom = input<View>('home');
  save = output<LawyerFormData>();
  back = output<void>();

  currentStep = signal(1);
  photoPreview = signal<string | null>(null);

  allCategories = [
    'Семейное право', 'Недвижимость', 'Бизнес-споры', 'Уголовное право',
    'Трудовое право', 'Наследство', 'Защита потребителей', 'Автомобильное право',
    'Интеллектуальная собственность'
  ];

  profileForm = new FormGroup({
    // Step 1
    fullName: new FormControl('', [Validators.required, Validators.pattern(/\S+\s+\S+/)]),
    city: new FormControl('', Validators.required),
    phone: new FormControl({ value: '', disabled: true }, Validators.required),
    photoUrl: new FormControl('', Validators.required),
    // Step 2
    primarySpecialization: new FormControl('', Validators.required),
    experienceYears: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    categories: new FormControl<string[]>([], [Validators.required, Validators.minLength(1)]),
    // Step 3
    bio: new FormControl('', Validators.required),
    otherSpecializations: new FormControl(''),
    // Step 4
    consultationPrice: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    offersFreeConsultation: new FormControl<boolean>(true),
    freeConsultationConditions: new FormControl(''),
  });

  isStep1Valid = signal(false);
  isStep2Valid = signal(false);
  isStep3Valid = signal(false);

  private getDraftStorageKey = (id: number) => `yurcheck_draft_profile_${id}`;
  private valueChangesSub?: Subscription;

  constructor() {
    // Restore step from session storage
    const savedStep = sessionStorage.getItem('registrationStep');
    if (savedStep) {
      this.currentStep.set(Number(savedStep));
    }

    // Auto-save step to session storage
    effect(() => {
      sessionStorage.setItem('registrationStep', this.currentStep().toString());
    });

    // This effect handles form initialization from either a draft or the lawyer input.
    effect(() => {
      const lawyerToEdit = this.lawyer();
      if (!lawyerToEdit) {
        return; // Wait for lawyer data
      }

      // 1. Base data is the "source of truth" from the lawyer object.
      const baseData = {
        fullName: lawyerToEdit.fullName,
        city: lawyerToEdit.city,
        photoUrl: lawyerToEdit.photoUrl,
        primarySpecialization: lawyerToEdit.primarySpecialization,
        experienceYears: lawyerToEdit.experienceYears,
        consultationPrice: lawyerToEdit.consultationPrice,
        offersFreeConsultation: lawyerToEdit.offersFreeConsultation,
        freeConsultationConditions: lawyerToEdit.freeConsultationConditions || '',
        categories: lawyerToEdit.categories,
        bio: lawyerToEdit.bio,
        otherSpecializations: lawyerToEdit.otherSpecializations.join(', ')
      };

      const draftKey = this.getDraftStorageKey(lawyerToEdit.id);
      const draftJson = sessionStorage.getItem(draftKey);
      let finalData = baseData; // Start with the source of truth

      if (draftJson) {
        try {
          const draft = JSON.parse(draftJson);
          
          // Create a copy of the draft to modify safely.
          const sanitizedDraft = { ...draft };
          
          // CRITICAL FIX: If the lawyer already has an official name, ALWAYS
          // prioritize it over whatever name is in the draft. This prevents
          // a stale draft name from overwriting the real one and causing
          // an accidental verification reset.
          if (lawyerToEdit.fullName) {
            sanitizedDraft.fullName = lawyerToEdit.fullName;
          }

          // Merge the sanitized draft over the base data. This preserves
          // unsaved work in other fields (like 'city' or 'bio') while
          // protecting the 'fullName' field.
          finalData = { ...baseData, ...sanitizedDraft };

        } catch (e) {
          console.error("Failed to parse draft data, using original lawyer data.", e);
        }
      }

      // Patch the form with the final, safe data.
      this.profileForm.patchValue(finalData, { emitEvent: false });
      if (finalData.photoUrl) {
        this.photoPreview.set(finalData.photoUrl);
      }
      
      // The phone number is non-editable and should always be synced.
      this.profileForm.controls.phone.patchValue(formatPhoneNumber(lawyerToEdit.phone), { emitEvent: false });
      this.updateValidity();

      // Set up auto-saving subscription for the current lawyer's draft.
      this.valueChangesSub?.unsubscribe();
      this.valueChangesSub = this.profileForm.valueChanges.pipe(
        debounceTime(500)
      ).subscribe(value => {
        sessionStorage.setItem(draftKey, JSON.stringify(value));
        this.updateValidity();
      });
    });

    // Initial validity check
    this.updateValidity();
  }
  
  ngOnDestroy(): void {
    this.valueChangesSub?.unsubscribe();
  }

  private updateValidity(): void {
    const ctrls = this.profileForm.controls;
    this.isStep1Valid.set(ctrls.fullName.valid && ctrls.city.valid && ctrls.photoUrl.valid);
    this.isStep2Valid.set(ctrls.primarySpecialization.valid && ctrls.experienceYears.valid && ctrls.categories.valid);
    this.isStep3Valid.set(ctrls.bio.valid);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const newPhotoUrl = `https://picsum.photos/seed/${Date.now()}/400/400`;
      this.photoPreview.set(newPhotoUrl);
      this.profileForm.controls.photoUrl.setValue(newPhotoUrl);
      this.profileForm.controls.photoUrl.markAsTouched();
      target.value = '';
    }
  }

  nextStep() {
    if (this.currentStep() < 4) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }
  
  toggleCategory(category: string) {
    const currentCategories = this.profileForm.controls.categories.value || [];
    const index = currentCategories.indexOf(category);
    if (index > -1) {
      currentCategories.splice(index, 1);
    } else {
      currentCategories.push(category);
    }
    this.profileForm.controls.categories.setValue([...currentCategories]);
    this.profileForm.controls.categories.markAsTouched();
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formValue = this.profileForm.getRawValue();

    const lawyerData: LawyerFormData = {
      fullName: formValue.fullName!,
      city: formValue.city!,
      phone: normalizePhoneNumber(formValue.phone!),
      photoUrl: formValue.photoUrl!,
      primarySpecialization: formValue.primarySpecialization!,
      experienceYears: formValue.experienceYears!,
      consultationPrice: formValue.consultationPrice!,
      categories: formValue.categories!,
      bio: formValue.bio!,
      otherSpecializations: formValue.otherSpecializations ? formValue.otherSpecializations.split(',').map(s => s.trim()).filter(s => s) : [],
      offersFreeConsultation: formValue.offersFreeConsultation!,
      freeConsultationConditions: formValue.offersFreeConsultation ? formValue.freeConsultationConditions || '' : '',
    };

    this.save.emit(lawyerData);
    
    const lawyerToEdit = this.lawyer();
    if (lawyerToEdit) {
      const draftKey = this.getDraftStorageKey(lawyerToEdit.id);
      sessionStorage.removeItem(draftKey);
    }
    sessionStorage.removeItem('registrationStep');
  }
}