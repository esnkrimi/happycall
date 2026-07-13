import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { PublicValsService } from './public-vals.service';
import { LocalStorageService } from './localstorage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  loadinProgress = false;
  pathFull = '';
  constructor(
    private publicValsService: PublicValsService,
    private route: ActivatedRoute,
    private localStorage: LocalStorageService,
  ) {}
  activeProgress(handle: boolean) {}
  ngOnInit(): void {}

  logoff() {}
}
