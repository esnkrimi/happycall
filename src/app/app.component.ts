import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { PublicValsService } from './public-vals.service';
import { LocalStorageService } from './localstorage';
import { PublicService } from './service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  loadinProgress = false;
  pathFull = '';
  user: any = {
    name: '',
    family: '',
  };
  constructor(
    private publicService: PublicService,
    private router: Router,
    private localStorage: LocalStorageService,
  ) {}
  activeProgress(handle: boolean) {}
  fetchUser() {
    this.user.name = this.localStorage.getItem('opfamily');
    this.user.family = this.localStorage.getItem('opname');
    this.user.level = this.localStorage.getItem('level');
    this.user.opType = this.localStorage.getItem('opType');
    this.user.opId = this.localStorage.getItem('opId');
    this.user.tell = this.localStorage.getItem('tell');
    this.user.address = this.localStorage.getItem('address');
  }
  ngOnInit(): void {
    this.publicService.loadingProgress.next(true);
    this.chechLoadingProgress();
    this.fetchUser();
  }
  chechLoadingProgress() {
    this.publicService.loadingProgress.subscribe((res: any) => {
      this.loadinProgress = res;
    });
  }
  logoff() {
    localStorage.setItem('loginedUser', '');
    this.localStorage.setItem('logined', 'true');
    this.localStorage.setItem('opname', '');
    this.localStorage.setItem('opfamily', '');
    this.localStorage.setItem('opType', '');
    this.localStorage.clear();
    this.router.navigate(['/auth']);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}
