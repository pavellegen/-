import { Component, ChangeDetectionStrategy, input, output, computed, inject, signal, effect } from '@angular/core';
import { Lawyer } from '../../models/lawyer.model.ts';
import { LawyerService } from '../../services/lawyer.service.ts';
import { FavoriteLawyerService } from '../../services/favorite.service.ts';
import { LawyerCardComponent } from '../lawyer-card/lawyer-card.component.ts';

// A helper type for our pre-computed search data
type SearchableLawyer = Lawyer & { searchableText: string };

@Component({
  selector: 'app-lawyer-list',
  templateUrl: './lawyer-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LawyerCardComponent]
})
export class LawyerListComponent {
  category = input.required<string>();
  lawyerSelected = output<Lawyer>();
  back = output<void>();

  private lawyerService = inject(LawyerService);
  private favoriteService = inject(FavoriteLawyerService);
  
  private readonly pageSize = 12;

  searchQuery = signal('');
  currentPage = signal(1);
  showOnlyFavorites = signal(false);
  showOnlyFreeConsultation = signal(false);
  selectedCity = signal<string>('all');
  showFilters = signal(false);
  
  // This signal holds all lawyers for the category, before filtering
  allLawyersInCategory = computed(() => this.lawyerService.getLawyersByCategory(this.category()));

  // Compute available cities for the dropdown filter.
  availableCities = computed<string[]>(() => {
    const cities = this.allLawyersInCategory().map(lawyer => lawyer.city);
    return [...new Set(cities)].sort();
  });

  areFiltersActive = computed(() => {
    return this.searchQuery().length > 0 || 
           this.selectedCity() !== 'all' || 
           this.showOnlyFavorites() ||
           this.showOnlyFreeConsultation();
  });

  // A new computed signal that prepares lawyers for fast searching by pre-calculating the searchable text.
  // This runs only when the category changes, not on every keystroke.
  private preparedLawyers = computed<SearchableLawyer[]>(() => {
    return this.allLawyersInCategory().map(lawyer => {
      const searchableText = [
        lawyer.fullName,
        lawyer.primarySpecialization,
        lawyer.city,
        lawyer.bio,
        ...lawyer.categories,
        ...lawyer.otherSpecializations
      ].join(' ').toLowerCase();
      
      return { ...lawyer, searchableText };
    });
  });

  // This signal now filters the pre-prepared list, which is much more efficient.
  filteredLawyers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let allPreparedLawyers = this.preparedLawyers();
    const onlyFavorites = this.showOnlyFavorites();
    const favoriteIds = this.favoriteService.getFavoriteIds()();
    const city = this.selectedCity();
    const onlyFree = this.showOnlyFreeConsultation();

    // 1. Filter by city
    if (city !== 'all') {
      allPreparedLawyers = allPreparedLawyers.filter(lawyer => lawyer.city === city);
    }
    
    // 2. Filter by favorites if the toggle is on
    if (onlyFavorites) {
        const favoriteSet = new Set(favoriteIds);
        allPreparedLawyers = allPreparedLawyers.filter(lawyer => favoriteSet.has(lawyer.id));
    }
    
    // 3. Filter by free consultation
    if (onlyFree) {
      allPreparedLawyers = allPreparedLawyers.filter(lawyer => lawyer.offersFreeConsultation);
    }

    // 4. Filter by search query
    if (!query) {
      return allPreparedLawyers;
    }

    return allPreparedLawyers.filter(lawyer => lawyer.searchableText.includes(query));
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredLawyers().length / this.pageSize);
  });

  paginatedLawyers = computed(() => {
    const lawyers = this.filteredLawyers();
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return lawyers.slice(start, end);
  });

  paginationSummary = computed(() => {
    const total = this.filteredLawyers().length;
    if (total === 0) return '';
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage() * this.pageSize, total);
    return `Показано ${start}–${end} из ${total}`;
  });

  constructor() {
    effect(() => {
      // This tracks the category input.
      this.category();
      // When it changes, reset page, city filter, and search.
      this.currentPage.set(1);
      this.selectedCity.set('all');
      this.searchQuery.set('');
    });
  }

  onSearchInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery.set(inputElement.value);
    this.currentPage.set(1);
  }

  onCityChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCity.set(selectElement.value);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  onSelectLawyer(lawyer: Lawyer) {
    this.lawyerSelected.emit(lawyer);
  }
  
  onBack() {
    this.back.emit();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
        this.currentPage.set(page);
        window.scrollTo(0, 0);
    }
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  toggleFavoritesFilter() {
    this.showOnlyFavorites.update(v => !v);
    this.currentPage.set(1);
  }
  
  toggleFreeConsultationFilter() {
    this.showOnlyFreeConsultation.update(v => !v);
    this.currentPage.set(1);
  }
}
