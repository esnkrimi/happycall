import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFa from '@angular/common/locales/fa';
registerLocaleData(localeFa);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {
      provide: LOCALE_ID,
      useValue: 'fa',
    },
  ],
};
