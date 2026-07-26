import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { LocalStorageService } from '../localstorage';
import { Router } from '@angular/router';
import { PublicValsService } from '../public-vals.service';
import { ServiceService } from './service.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl('admin', Validators.required),
    password: new FormControl('', Validators.required),
  });
  user: any;
  loadingProgress = false;
  constructor(
    private localStorage: LocalStorageService,
    private router: Router,
    private publicValsService: PublicValsService,
    private serviceService: ServiceService,
  ) {}
  ngOnInit(): void {
    if (this.localStorage.getItem('isLoggedIn') === 'true') {
      this.router.navigate(['/']);
    }
    this.publicValsService.loadinProgress.subscribe((res) => {
      this.loadingProgress = res;
    });
  }
  login() {
    this.publicValsService.loadinProgress.next(true);
    const username: any = this.loginForm.get('username')?.value;
    const password: any = this.loginForm.get('password')?.value;
    this.serviceService
      .login(username, password)
      .pipe(map((res: any) => res[0]))
      .subscribe((res: any) => {
        this.user = res;
        this.localStorage.setItem('isLoggedIn', 'true');
        this.localStorage.setItem('opname', res.name);
        this.localStorage.setItem('opfamily', res.family);
        this.localStorage.setItem('opType', res.type);
        this.localStorage.setItem('opId', res.id);
        console.log(this.user);
        setTimeout(() => {
          this.router.navigate(['']);
          this.publicValsService.loadinProgress.next(false);
        }, 1);
      });
  }
}
