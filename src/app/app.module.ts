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
import { MatInputModule } from '@angular/material/input';
import { InputDataComponent } from './input-data/input-data.component';
import { LoginComponent } from './login/login.component';
import { MydataComponent } from './mydata/mydata.component';
import { JalaliDatePipe } from './shared/pipes/jalali-date.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DontrefrenceComponent } from './dontrefrence/dontrefrence.component';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MydatChartComponent } from './chart/chart.component';
export const DEVICE_WIDTH = new InjectionToken<string>('DEVICE_WIDTH');
export const KONVA = new InjectionToken<string>('konva');
export const DEVICE_TYPE_IS_PC = new InjectionToken<string>(
  'DEVICE_TYPE_IS_PC',
);
export function detectDevice(width: any): boolean {
  return width < 1025 ? false : true;
}
import { MatSelectModule } from '@angular/material/select';
import { BaseChartDirective } from 'ng2-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

registerLocaleData(localeFa);

@NgModule({
  declarations: [
    AppComponent,
    MydataComponent,
    InputDataComponent,
    DontrefrenceComponent,
    JalaliDatePipe,
    LoginComponent,
    MydatChartComponent,
  ],
  imports: [
    BrowserModule,
    NgxPaginationModule,
    PersianPipe,
    CommonModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    FormsModule,
    MatSelectModule,
    BaseChartDirective,
    MatTableModule,
    MatFormFieldModule,
    AppRoutingModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatInputModule,
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
