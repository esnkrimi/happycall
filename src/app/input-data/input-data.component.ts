import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '../localstorage';
import { Router } from '@angular/router';
import { PublicValsService } from '../public-vals.service';
import { ServiceService } from './service.service';
import { map, tap } from 'rxjs';
import { PublicService } from '../service.service';

@Component({
  selector: 'app-input-data',
  templateUrl: './input-data.component.html',
  styleUrl: './input-data.component.scss',
})
export class InputDataComponent implements OnInit {
  loadingProgress = false;
  unsatisfying = false;
  unsatisfyingTypes = [
    'link',
    'خرابی مودم',
    'تنظیمات مودم',
    'پورت',
    'قطع و وصل',
    'فطع کامل',
    'عدم استفاده کاربر',
    'فاصله از مرکز',
    'مشکلات داخلی',
    'رانژه',
    'سرعت',
  ];
  selectedUnsatisfying: any = [];
  userFailure: any = [];
  constructor(
    private localStorage: LocalStorageService,
    private router: Router,
    private publicValsService: PublicValsService,
    private serviceService: ServiceService,
    private publicService: PublicService,
  ) {}
  ngOnInit(): void {
    this.fetchMyFailures();
  }
  formInput = new FormGroup({
    tell: new FormControl('', Validators.required),
    opname: new FormControl('', Validators.required),
    opfamily: new FormControl('', Validators.required),
    opType: new FormControl('', Validators.required),
    typehc: new FormControl('', Validators.required),
    datetime: new FormControl(''),
    result: new FormControl('', Validators.required),
    opId: new FormControl('', Validators.required),
    resultunsatisfying: new FormControl('', Validators.required),
    repairDateTime: new FormControl('', Validators.required),
  });
  changeUnsatisfying(event: any, item: any) {
    if (event.target.checked) {
      this.selectedUnsatisfying.push(item);
    } else {
      this.selectedUnsatisfying = this.selectedUnsatisfying.filter(
        (x: any) => x !== item,
      );
    }

    this.formInput
      .get('resultunsatisfying')
      ?.setValue(JSON.stringify(this.selectedUnsatisfying));
  }
  fetchMyFailures() {
    this.serviceService
      .fetchMyFailures(this.localStorage.getItem('opId'))
      .pipe(
        map((res: any) =>
          res.map((item: any) => ({
            ...item,
            result: item.result === 'unsatisfy' ? 'ناراضی' : 'راضی',
          })),
        ),
        map((res: any) =>
          res.map((item: any) => ({
            ...item,
            resultunsatisfying: item.resultunsatisfying
              ? JSON.parse(item.resultunsatisfying)
              : [],
          })),
        ),
      )
      .subscribe((res) => {
        this.userFailure = res;
        setTimeout(() => {
          this.publicService.loadingProgress.next(false);
        }, 3);
      });
  }
  submit() {
    this.publicService.loadingProgress.next(true);
    const shamsiDate = new Intl.DateTimeFormat('fa-IR').format(new Date());
    this.formInput.get('opname')?.setValue(this.localStorage.getItem('opname'));
    this.formInput
      .get('opfamily')
      ?.setValue(this.localStorage.getItem('opfamily'));
    this.formInput.get('opType')?.setValue(this.localStorage.getItem('opType'));
    this.formInput.get('opId')?.setValue(this.localStorage.getItem('opId'));
    this.formInput.get('datetime')?.setValue(shamsiDate);
    this.serviceService.submitFail(this.formInput.value).subscribe((res) => {
      this.fetchMyFailures();
      console.log(res);
    });
  }
  changeResult(result: any) {
    this.unsatisfying =
      this.formInput.get('result')?.value === 'unsatisfy' ? true : false;
  }
}
