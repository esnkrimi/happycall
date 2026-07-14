import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '../localstorage';
import { Router } from '@angular/router';
import { PublicValsService } from '../public-vals.service';
import { ServiceService } from './service.service';

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
  constructor(
    private localStorage: LocalStorageService,
    private router: Router,
    private publicValsService: PublicValsService,
    private serviceService: ServiceService,
  ) {}
  ngOnInit(): void {}
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
  submit() {
    const shamsiDate = new Intl.DateTimeFormat('fa-IR').format(new Date());
    this.formInput.get('opname')?.setValue(this.localStorage.getItem('opname'));
    this.formInput
      .get('opfamily')
      ?.setValue(this.localStorage.getItem('opfamily'));
    this.formInput.get('opType')?.setValue(this.localStorage.getItem('opType'));
    this.formInput.get('opId')?.setValue(this.localStorage.getItem('opId'));
    this.formInput.get('datetime')?.setValue(shamsiDate);

    this.serviceService.submitFail(this.formInput.value).subscribe((res) => {
      console.log(res);
    });
  }
  changeResult(result: any) {
    this.unsatisfying =
      this.formInput.get('result')?.value === 'unsatisfy' ? true : false;
  }
}
