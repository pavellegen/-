import { Injectable, signal, afterNextRender, Injector, runInInjectionContext } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal(false);

  constructor(private injector: Injector) {}

  initializeTheme(): void {
    // Run after next render to ensure `window` and `document` are available.
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        // Default to light theme if the preference cannot be determined
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.isDarkMode.set(mediaQuery.matches);
        this.updateBodyClass(mediaQuery.matches);

        mediaQuery.addEventListener('change', (e) => {
          this.isDarkMode.set(e.matches);
          this.updateBodyClass(e.matches);
        });
      });
    });
  }

  private updateBodyClass(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
