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
  answer = [
    {
      answer: 'بسیار راضی',
      score: 5,
    },
    {
      answer: 'راضی',
      score: 4,
    },
    {
      answer: 'متوسط',
      score: 3,
    },
    {
      answer: 'ناراضی',
      score: 2,
    },
    {
      answer: 'بسیار ناراضی',
      score: 1,
    },
  ];
  handle = 0;
  formSuggest = new FormGroup({
    modelText: new FormControl('', Validators.required),
  });
  scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  paginationPageNumber = 1;
  loadingProgress = false;
  unsatisfying = false;
  unsatisfyingEdit = false;
  ques: any = [];
  filteredName: any = '';
  editID = 0;
  del = false;
  formEdit = new FormGroup({
    tell: new FormControl('', Validators.required),
    opname: new FormControl(''),
    opfamily: new FormControl(''),
    opType: new FormControl(''),
    typehc: new FormControl(''),
    datetime: new FormControl(''),
    result: new FormControl(''),
    opId: new FormControl(''),
    resultunsatisfying: new FormControl(''),
    repairDateTime: new FormControl(''),
  });
  modal = false;
  modalDel = false;
  filterName = new FormGroup({
    name: new FormControl(''),
  });
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
  editRow: any;
  constructor(
    private localStorage: LocalStorageService,
    private router: Router,
    private publicValsService: PublicValsService,
    private serviceService: ServiceService,
    private publicService: PublicService,
  ) {}

  modalShow(id: any, del: boolean) {
    this.editID = id;
    this.del = del;
    this.modal = true;
    this.editRow = this.userFailure.filter((res: any) => res.id === id)[0].tell;
    this.formEdit.get('tell')?.setValue(this.editRow);
  }

  modalDelShow(item: any, del: boolean) {
    this.editID = item;
    this.del = del;
    this.modalDel = true;
  }

  ngOnInit(): void {
    this.fetchMyFailures();
    this.listenTofilterName();
    this.fetchMyQ();
  }
  listenTofilterName() {
    this.filterName.get('name')?.valueChanges.subscribe((res) => {
      this.filteredName = res;
      console.log(res);
    });
  }
  filterCheck(item: string, item2: string) {
    const result = item.includes(item2) || item2.includes(item) || item2 === '';
    return result;
  }
  formInput = new FormGroup({
    tell: new FormControl('', [Validators.required, Validators.minLength(5)]),
    opname: new FormControl(''),
    opfamily: new FormControl(''),
    opType: new FormControl(''),
    typehc: new FormControl(''),
    datetime: new FormControl(''),
    result: new FormControl(''),
    opId: new FormControl(''),
    resultunsatisfying: new FormControl(''),
    repairDateTime: new FormControl(''),
  });
  resultTotal: any = [];
  score: any;
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

  fetchMyQ() {
    const userLevel: any = this.localStorage.getItem('level');
    this.serviceService
      .fetchMyQ()
      .pipe(
        map((res: any) => res.filter((res: any) => res.level === userLevel)),
      )
      .subscribe((res) => {
        this.ques = res;
      });
  }

  fetchMyFailures() {
    this.publicService.loadingProgress.next(false);

    this.serviceService
      .fetchMyFailures(this.localStorage.getItem('opId'))
      .pipe(
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
  events(pageNumber: any) {
    this.paginationPageNumber = pageNumber;
  }
  update() {
    this.publicService.loadingProgress.next(true);
    const shamsiDate = new Intl.DateTimeFormat('fa-IR').format(new Date());
    this.formEdit.get('opname')?.setValue(this.localStorage.getItem('opname'));
    this.formEdit
      .get('opfamily')
      ?.setValue(this.localStorage.getItem('opfamily'));
    this.formEdit.get('opType')?.setValue(this.localStorage.getItem('opType'));
    this.formEdit.get('opId')?.setValue(this.localStorage.getItem('opId'));
    this.formEdit.get('datetime')?.setValue(shamsiDate);
    this.serviceService
      .edit(this.formEdit.value, this.editID)
      .subscribe((res) => {
        this.fetchMyFailures();
        this.modal = false;
      });
  }
  delete() {
    this.serviceService.delete(this.editID).subscribe((res) => {
      this.fetchMyFailures();
      this.modalDel = false;
      this.modal = false;
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
    this.serviceService.submitFail(this.resultTotal).subscribe((res) => {
      window.location.reload();
    });
  }
  changeResult(result: any, item: any) {
    this.handle++;
    this.score = result?.target?.value;
    const tell = this.formInput.get('tell')?.value;
    const userID = this.localStorage.getItem('opId');
    this.resultTotal = this.resultTotal.filter((x: any) => x.id !== item.id);
    this.resultTotal.push({
      ...item,
      score: this.score,
      userid: userID,
      tell: tell,
      ratescore: Number(this.score) * Number(item.rate),
    });
  }
  getType() {
    const res = this.formInput.get('typehc')?.value;
    return res;
  }
  changeResultEdit(result: any) {
    this.unsatisfyingEdit =
      this.formEdit.get('result')?.value === 'unsatisfy' ? true : false;
  }
  chechtell() {
    const tell: any = this.formInput.get('tell')?.value;
    return tell.length;
  }
}
