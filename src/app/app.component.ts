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
  constructor(
    private publicService: PublicService,
    private route: ActivatedRoute,
    private localStorage: LocalStorageService,
  ) {}
  activeProgress(handle: boolean) {}
  ngOnInit(): void {
    this.chechLoadingProgress();
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
    window.location.reload();
  }
}
