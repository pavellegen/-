
import '@angular/compiler';
import { bootstrapApplication, Title, Meta } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './src/app.component';

// FIX: Provide `Title` and `Meta` at the application root to ensure they are available
// for dependency injection throughout the application, resolving the errors in `AppComponent`.
bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    Title,
    Meta,
  ],
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.