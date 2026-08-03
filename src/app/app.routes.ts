import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { InputDataComponent } from './input-data/input-data.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';
import { MydataComponent } from './mydata/mydata.component';

export const routes: Routes = [
  {
    path: '',
    component: InputDataComponent,
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    component: LoginComponent,
  },
  {
    path: 'mydata',
    component: MydataComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
