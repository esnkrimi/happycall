import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { InjectionToken, NgModule } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFa from '@angular/common/locales/fa';
import { AppComponent } from './app.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule, routes } from './app.routes';
import { NgxPaginationModule } from 'ngx-pagination';
import { PersianPipe } from './persian.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { InputDataComponent } from './input-data/input-data.component';
import { LoginComponent } from './login/login.component';

export const DEVICE_WIDTH = new InjectionToken<string>('DEVICE_WIDTH');
export const KONVA = new InjectionToken<string>('konva');
export const DEVICE_TYPE_IS_PC = new InjectionToken<string>(
  'DEVICE_TYPE_IS_PC',
);
export function detectDevice(width: any): boolean {
  return width < 1025 ? false : true;
}
registerLocaleData(localeFa);

@NgModule({
  declarations: [
    AppComponent,InputDataComponent,LoginComponent
  ],
  imports: [
    BrowserModule,
    NgxPaginationModule,
    PersianPipe,
    CommonModule,
    AppRoutingModule,
    MatButtonModule,
    MatProgressBarModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fa' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: DEVICE_TYPE_IS_PC,
      useFactory: detectDevice,
      deps: [DEVICE_WIDTH],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
