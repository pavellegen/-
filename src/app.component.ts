import { Component, ChangeDetectionStrategy, signal, inject, afterNextRender, effect, Injector, runInInjectionContext } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { HomeComponent } from './components/home/home.component';
import { LawyerListComponent } from './components/lawyer-list/lawyer-list.component';
import { LawyerProfileComponent } from './components/lawyer-profile/lawyer-profile.component';
import { LawyerProfileEditorComponent } from './components/lawyer-profile-editor/lawyer-profile-editor.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { ReviewModalComponent } from './components/review-modal/review-modal.component';
import { Lawyer } from './models/lawyer.model';
import { LawyerService } from './services/lawyer.service';
import { NotificationService } from './services/notification.service';
import { ThemeService } from './services/theme.service';
import { ConsultationService } from './services/consultation.service';

type View = 'home' | 'list' | 'profile' | 'profileEditor' | 'admin';

// FIX: Removed the component-level `providers` array. `Title` and `Meta` services are now
// provided at the application root in `index.tsx` to resolve the dependency injection errors.
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HomeComponent,
    LawyerListComponent,
    LawyerProfileComponent,
    LawyerProfileEditorComponent,
    AdminPanelComponent,
    ReviewModalComponent
  ],
})
export class AppComponent {
  private lawyerService = inject(LawyerService);
  private notificationService = inject(NotificationService);
  private consultationService = inject(ConsultationService);
  // FIX: Explicitly type `title` and `meta` to resolve TypeScript's inference issue where `inject` was returning `unknown`.
  private title: Title = inject(Title);
  private meta: Meta = inject(Meta);
  private injector = inject(Injector);
  private themeService = inject(ThemeService);
  private readonly storageKey = 'loggedInLawyerId';

  currentView = signal<View>('home');
  selectedCategory = signal<string | null>(null);
  selectedLawyer = signal<Lawyer | null>(null);
  isViewingOwnProfile = signal(false);
  loggedInLawyer = signal<Lawyer | null>(null);
  private scrollToAnchor = signal<string | null>(null);
  editCameFrom = signal<View>('home');

  private scrollEffect = effect(() => {
    const anchor = this.scrollToAnchor();
    if (anchor) {
      runInInjectionContext(this.injector, () => {
        afterNextRender(() => {
          const element = document.querySelector(anchor);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo(0, 0);
          }
          // Reset the signal after scrolling
          this.scrollToAnchor.set(null);
        });
      });
    }
  });

  private seoEffect = effect(() => {
    const view = this.currentView();
    const lawyer = this.selectedLawyer();
    const category = this.selectedCategory();

    switch (view) {
      case 'home':
        this.title.setTitle('ЮрЧек - Найдите проверенного юриста');
        this.meta.updateTag({ name: 'description', content: 'ЮрЧек помогает найти надежного, проверенного юриста для решения вашей проблемы. Упрощаем выбор и организуем первую бесплатную консультацию.' });
        break;
      case 'list':
        if (category) {
          this.title.setTitle(`Юристы по категории: ${category} | ЮрЧек`);
          this.meta.updateTag({ name: 'description', content: `Найдите лучших юристов по специализации "${category}". Просматривайте профили, читайте отзывы и записывайтесь на консультацию.` });
        }
        break;
      case 'profile':
        if (lawyer) {
          this.title.setTitle(`${lawyer.fullName} - ${lawyer.primarySpecialization} | ЮрЧек`);
          const description = lawyer.bio.length > 160 ? lawyer.bio.substring(0, 157) + '...' : lawyer.bio;
          this.meta.updateTag({ name: 'description', content: description });
        }
        break;
      case 'profileEditor':
        this.title.setTitle('Редактирование профиля | ЮрЧек');
        this.meta.updateTag({ name: 'description', content: 'Заполните или отредактируйте свой профиль юриста на платформе ЮрЧек.' });
        break;
      case 'admin':
        this.title.setTitle('Админ-панель | ЮрЧек');
        this.meta.updateTag({ name: 'description', content: 'Управление юристами на платформе ЮрЧек.' });
        break;
    }
  });

  constructor() {
    this.themeService.initializeTheme();

    const lawyerId = localStorage.getItem(this.storageKey);
    if (lawyerId) {
      const lawyer = this.lawyerService.getLawyerById(+lawyerId);
      if (lawyer) {
        this.loggedInLawyer.set(lawyer);
      }
    }
    
    // Handle hash-based routing for admin panel
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        const handleHash = () => {
          if (window.location.hash === '#/admin') {
            this.currentView.set('admin');
          }
        };
        handleHash(); // For initial load
        window.addEventListener('hashchange', handleHash);

        // Check for notifications after app has initialized
        setTimeout(() => {
           this.notificationService.checkAndNotifyLawyers();
         }, 3000); // Delay to simulate a background task

         // Periodically check for consultation reminders
         setInterval(() => {
           this.consultationService.checkReminders();
         }, 60000); // Check every minute
      });
    });
  }

  showListForCategory(category: string) {
    this.selectedCategory.set(category);
    this.isViewingOwnProfile.set(false);
    this.currentView.set('list');
    window.scrollTo(0, 0);
  }

  showProfile(lawyer: Lawyer, isOwner = false) {
    this.selectedLawyer.set(lawyer);
    this.isViewingOwnProfile.set(isOwner);
    this.currentView.set('profile');
    window.scrollTo(0, 0);
  }
  
  startRegistration(phone: string) {
    const newLawyer = this.lawyerService.createDraftLawyer(phone);
    this.loggedInLawyer.set(newLawyer);
    localStorage.setItem(this.storageKey, newLawyer.id.toString());
    this.selectedLawyer.set(newLawyer);
    this.isViewingOwnProfile.set(true); // It's their own (new) profile
    this.editCameFrom.set('home');
    this.currentView.set('profileEditor');
    window.scrollTo(0, 0);
  }

  editProfile() {
    this.editCameFrom.set('profile');
    this.currentView.set('profileEditor');
    window.scrollTo(0, 0);
  }

  continueEditingProfile() {
    if (this.loggedInLawyer()) {
      this.selectedLawyer.set(this.loggedInLawyer());
      this.isViewingOwnProfile.set(true);
      this.editCameFrom.set('home');
      this.currentView.set('profileEditor');
      window.scrollTo(0, 0);
    }
  }

  editFromAdmin(lawyer: Lawyer) {
    this.editCameFrom.set('admin');
    this.selectedLawyer.set(lawyer);
    this.isViewingOwnProfile.set(false);
    this.currentView.set('profileEditor');
    window.scrollTo(0, 0);
  }
  
  goToMyProfile() {
    if (this.loggedInLawyer()) {
      this.showProfile(this.loggedInLawyer()!, true);
    }
  }

  logInLawyer(lawyer: Lawyer) {
    this.loggedInLawyer.set(lawyer);
    localStorage.setItem(this.storageKey, lawyer.id.toString());
    if (!lawyer.fullName) { // If profile is incomplete
      this.continueEditingProfile();
    } else {
      this.goToMyProfile();
    }
  }

  saveProfile(lawyerData: Omit<Lawyer, 'id' | 'reviews' | 'caseExamples' | 'consultationsHeld' | 'winRate' | 'registrationDate' | 'verificationStatus' | 'rejectionReason' | 'verificationInfo' | 'isPublished' | 'smsNotificationsEnabled' | 'balance'>) {
    const currentlyEditingId = this.selectedLawyer()?.id;
    if (!currentlyEditingId) return;

    // Fetch the pristine "before" state from the single source of truth to prevent bugs from stale component state.
    const lawyerBeforeUpdate = this.lawyerService.getLawyerById(currentlyEditingId);
    if (!lawyerBeforeUpdate) {
      console.error("Lawyer to update not found in service.");
      return;
    }

    const fromAdmin = this.editCameFrom() === 'admin';
    const isOwnProfile = this.isViewingOwnProfile();

    const updatedLawyer: Lawyer = {
      ...lawyerBeforeUpdate,
      ...lawyerData,
      isPublished: true, // A saved profile is always considered published.
    };
    
    // Reset verification status ONLY if the full name has changed.
    // This comparison is now robust as it uses the pristine state from the service.
    if (lawyerBeforeUpdate.fullName !== updatedLawyer.fullName) {
      updatedLawyer.verificationStatus = 'none';
      updatedLawyer.verificationInfo = undefined;
      updatedLawyer.rejectionReason = undefined;
    }

    this.lawyerService.updateLawyer(updatedLawyer);
    
    if (isOwnProfile) {
      this.loggedInLawyer.set(updatedLawyer);
    }

    if (fromAdmin) {
      this.currentView.set('admin');
    } else {
      this.showProfile(updatedLawyer, isOwnProfile);
    }
  }

  handleEditorBack() {
    const from = this.editCameFrom();
    if (from === 'profile') {
      this.currentView.set('profile');
    } else if (from === 'admin') {
      this.currentView.set('admin');
    } else {
      this.goHome();
    }
  }

  goBackToList() {
    const wasViewingOwnProfile = this.isViewingOwnProfile();
    const lawyerBeingViewed = this.selectedLawyer();
    const categoryUserCameFrom = this.selectedCategory();

    this.selectedLawyer.set(null);
    this.isViewingOwnProfile.set(false);

    if (categoryUserCameFrom) {
      // Standard flow: user came from a list, go back to it.
      this.currentView.set('list');
      window.scrollTo(0, 0);
    } else if (wasViewingOwnProfile && lawyerBeingViewed?.categories?.[0]) {
      // Lawyer's flow: came from create/edit, go to their primary category list.
      this.selectedCategory.set(lawyerBeingViewed.categories[0]);
      this.currentView.set('list');
      window.scrollTo(0, 0);
    } else {
      // Fallback for any other case (e.g., deep link with no category context).
      this.goHome();
    }
  }

  goHome(anchor?: string) {
    this.selectedCategory.set(null);
    this.selectedLawyer.set(null);
    // Do not clear isViewingOwnProfile, as it's tied to loggedInLawyer
    this.currentView.set('home');

    // Remove hash from URL
    if (window.location.hash) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
    
    if (anchor) {
      this.scrollToAnchor.set(anchor);
    } else {
      window.scrollTo(0, 0);
    }
  }

  // --- Admin Panel Methods ---
  deleteLawyerFromAdmin(id: number) {
    this.lawyerService.deleteLawyer(id);
  }
}
