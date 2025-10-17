import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoriteLawyerService {
  private readonly storageKey = 'yurcheck_favorite_lawyers';
  private favoriteIds = signal<number[]>([]);

  constructor() {
    this.favoriteIds.set(this.loadFromStorage());

    effect(() => {
      this.saveToStorage(this.favoriteIds());
    });
  }

  private loadFromStorage(): number[] {
    try {
      const storedData = localStorage.getItem(this.storageKey);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load favorite lawyers from localStorage', e);
    }
    return [];
  }

  private saveToStorage(ids: number[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to save favorite lawyers to localStorage', e);
    }
  }

  getFavoriteIds() {
    return this.favoriteIds.asReadonly();
  }

  toggleFavorite(lawyerId: number) {
    this.favoriteIds.update(ids => {
      const index = ids.indexOf(lawyerId);
      if (index > -1) {
        // Remove from favorites
        return [...ids.slice(0, index), ...ids.slice(index + 1)];
      } else {
        // Add to favorites
        return [...ids, lawyerId];
      }
    });
  }
}
