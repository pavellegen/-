import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { Lawyer, Review } from '../../models/lawyer.model';
import { FavoriteLawyerService } from '../../services/favorite.service';

@Component({
  selector: 'app-lawyer-card',
  templateUrl: './lawyer-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative block bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer'
  }
})
export class LawyerCardComponent {
  lawyer = input.required<Lawyer>();
  favoriteService = inject(FavoriteLawyerService);
  
  favoriteIds = this.favoriteService.getFavoriteIds();

  calculateAverageRating(reviews: Review[]): string {
    if (!reviews || reviews.length === 0) {
      return '0';
    }
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }

  getReviewNoun(count: number): string {
    const cases = [2, 0, 1, 1, 1, 2];
    const titles = ['отзыв', 'отзыва', 'отзывов'];
    const index = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[(count % 10 < 5) ? count % 10 : 5];
    return titles[index];
  }

  getCaseNoun(count: number): string {
    const cases = [2, 0, 1, 1, 1, 2];
    const titles = ['дело', 'дела', 'дел'];
    const index = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[(count % 10 < 5) ? count % 10 : 5];
    return titles[index];
  }

  toggleFavorite(event: MouseEvent, lawyerId: number) {
    event.stopPropagation();
    this.favoriteService.toggleFavorite(lawyerId);
  }
}