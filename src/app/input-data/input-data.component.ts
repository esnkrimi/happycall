import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '../localstorage';
import { Router } from '@angular/router';
import { PublicValsService } from '../public-vals.service';
import { ServiceService } from './service.service';
import { map, tap } from 'rxjs';
import { PublicService } from '../service.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
@Component({
  selector: 'app-input-data',
  templateUrl: './input-data.component.html',
  styleUrl: './input-data.component.scss',
})
export class InputDataComponent implements OnInit {
  loadQ = false;
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
  showDetails = -1;
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
  groupedData: any = [];
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
  exportExcel(): void {
    const element = document.getElementById('reportTable');

    if (!element) {
      return;
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const workbook: XLSX.WorkBook = {
      Sheets: { Report: worksheet },
      SheetNames: ['Report'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    FileSaver.saveAs(data, 'Report.xlsx');
  }
  ngOnInit(): void {
    this.fetchMyFailures();
    this.listenTofilterName();
  }
  listenTofilterName() {
    this.filterName.get('name')?.valueChanges.subscribe((res) => {
      this.filteredName = res;
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

  async fetchMyQ(type: any) {
    const userLevel: any = this.localStorage.getItem('level');
    this.serviceService
      .fetchMyQ(type)
      .pipe(
        map((res: any) => res.filter((res: any) => res.level === userLevel)),
      )
      .subscribe((res) => {
        this.ques = res;
        setTimeout(() => {
          this.loadQ = false;
        }, 500);
      });
  }

  fetchMyFailures() {
    this.publicService.loadingProgress.next(false);
    this.loadQ = true;
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
        this.groupedData = Object.entries(
          res.reduce((acc: any, item: any) => {
            (acc[item.tell] ??= []).push(item);
            return acc;
          }, {}),
        ).map(([tell, items]) => ({
          tell,
          items,
        }));

        setTimeout(() => {
          this.loadQ = false;
        }, 300);
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
  async typeQ(type: any) {
    this.loadQ = true;
    await this.fetchMyQ(type?.target.value);
    setTimeout(() => {
      this.handle = this.handle + 1;
    }, 1000);
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
    const type = this.formInput.get('typehc')?.value;
    this.serviceService.submitFail(this.resultTotal, type).subscribe((res) => {
      alert('با موفقیت ثبت شد');
      window.location.reload();
    });
  }
  changeResultText(result: any, item: any) {
    this.handle++;
    this.score = this.formSuggest.get('modelText')?.value;
    const tell = this.formInput.get('tell')?.value;
    const userID = this.localStorage.getItem('opId');
    this.resultTotal = this.resultTotal.filter(
      (x: any) => x.qsid !== item.qsid,
    );
    this.resultTotal.push({
      ...item,
      score: this.score,
      userid: userID,
      tell: tell,
      ratescore: Number(this.score) * Number(item.rate),
    });
  }
  changeResult(result: any, item: any) {
    this.handle++;
    this.score = result?.target?.value;
    const tell = this.formInput.get('tell')?.value;
    const userID = this.localStorage.getItem('opId');
    this.resultTotal = this.resultTotal.filter(
      (x: any) => x.qsid !== item.qsid,
    );
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
