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
  loadingProgress = false;
  constructor(
    private localStorage: LocalStorageService,
    private router: Router,
    private publicValsService: PublicValsService,
  ) {}
  ngOnInit(): void {
    if (this.localStorage.getItem('logined') === 'true') {
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
    if (username === 'admin' && password === 'admin') {
      this.localStorage.setItem('loginedUser', 'true');
      setTimeout(() => {
        console.log('yes')
        this.publicValsService.loadinProgress.next(false);
        this.router.navigate(['']);
      }, 1000);
    } else {
      this.localStorage.setItem('logined', 'false');
    }
    setTimeout(() => {
      this.publicValsService.loadinProgress.next(false);
    }, 1000);
  }
}
