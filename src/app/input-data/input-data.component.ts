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
  valuesSelected: any = [];
  userloginedLevel: any;
  userPreviousFailure: any = [];
  answer = [
    {
      answer: 'عالی',
      score: 'عالی',
    },
    {
      answer: 'خوب',
      score: 'خوب',
    },
    {
      answer: 'متوسط',
      score: 'متوسط',
    },
    {
      answer: 'ضعیف',
      score: 'ضعیف',
    },
  ];
  isOn = false;

  showDetails = -1;
  handle = 0;
  formSuggest = new FormGroup({
    modelText: new FormControl('', Validators.required),
  });
  formSuggest2 = new FormGroup({
    modelText2: new FormControl('', Validators.required),
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
  getCeilSpecial(ceil: any) {
    const res: any = [];
    for (let i = 0; i < ceil; i++) {
      res.push[i + 1];
    }
    return res;
  }
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
    this.fetchPreviousFailures(this.localStorage.getItem('level'));
    this.fetchMyFailures();
    this.listenTofilterName();
    this.userloginedLevel = this.localStorage.getItem('level');
  }
  listenTofilterName() {
    this.filterName.get('name')?.valueChanges.subscribe((res) => {
      this.filteredName = res;
    });
  }

  updateDontRefre() {
    const tell = this.formInput.get('tell')?.value;
    const pey_name = this.formInput.get('pey_name')?.value;
    const pey_qrcode = this.formInput.get('pey_qrcode')?.value;
    const userID = this.localStorage.getItem('opId');
    const ticket_number = this.formInput.get('ticket_number')?.value;
    const ticket_date = this.formInput.get('ticket_date')?.value;
    this.serviceService
      .updateDontRefre(
        tell,
        pey_name,
        pey_qrcode,
        userID,
        ticket_number,
        ticket_date,
      )
      .subscribe((res) => {
        alert('با موفقیت ثبت شد');
        window.location.reload();
      });
  }
  filterCheck(item: string, item2: string) {
    const result = item.includes(item2) || item2.includes(item) || item2 === '';
    return result;
  }
  isOnChange(event: any) {
    if (event.checked) {
      this.isOn = true;
    } else {
      this.isOn = false;
    }
  }
  formInput = new FormGroup({
    tell: new FormControl('', [Validators.required, Validators.minLength(5)]),
    opname: new FormControl(''),
    opfamily: new FormControl(''),
    opType: new FormControl(''),
    pey_qrcode: new FormControl(''),
    pey_name: new FormControl(''),
    ticket_date: new FormControl(''),
    ticket_number: new FormControl(''),
    typehc: new FormControl(''),
    datetime: new FormControl(''),
    result: new FormControl(''),
    opId: new FormControl(''),
    resultunsatisfying: new FormControl(''),
    repairDateTime: new FormControl(''),
  });

  formResult = new FormGroup({
    q1: new FormControl(''),
    q2: new FormControl(''),
    q3: new FormControl(''),
    q4: new FormControl(''),
    q5: new FormControl(''),
    q6: new FormControl(''),
    q7: new FormControl(''),
    q8: new FormControl(''),
    q9: new FormControl(''),
    q10: new FormControl(''),
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

  toggle(): void {
    this.isOn = !this.isOn;
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

  fetchPreviousFailures(level: any) {
    this.publicService.loadingProgress.next(false);
    this.loadQ = true;
    this.serviceService.fetchPreviousFailures(level).subscribe((res) => {
      this.userPreviousFailure = res;
      this.userPreviousFailure = this.userPreviousFailure.filter(
        (res: any) => res.refrence !== '0',
      );
    });
  }
  chooseTell(tell: any) {
    this.formInput.get('tell')?.setValue(tell);
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

  changeResultText(result: any, item: any) {
    this.handle++;
    this.score = this.formSuggest.get('modelText')?.value;
    const tell = this.formInput.get('tell')?.value;
    const pey_qrcode = this.formInput.get('pey_qrcode')?.value;
    const pey_name = this.formInput.get('pey_name')?.value;
    const ticket_number = this.formInput.get('ticket_number')?.value;
    const ticket_date = this.formInput.get('ticket_date')?.value;
    const userID = this.localStorage.getItem('opId');
    this.resultTotal = this.resultTotal.filter(
      (x: any) => x.qsid !== item.qsid,
    );
    this.resultTotal.push({
      ...item,
      score: this.score,
      userid: userID,
      tell: tell,
      pey_qrcode: pey_qrcode,
      pey_name: pey_name,
      ticket_number: ticket_number,
      ticket_date: ticket_date,
      ratescore: Number(this.score) * Number(item.rate),
    });
  }
  changeResultText2(result: any, item: any) {
    this.handle++;
    this.score = this.formSuggest2.get('modelText2')?.value;
    const tell = this.formInput.get('tell')?.value;
    const pey_qrcode = this.formInput.get('pey_qrcode')?.value;
    const pey_name = this.formInput.get('pey_name')?.value;
    const ticket_number = this.formInput.get('ticket_number')?.value;
    const ticket_date = this.formInput.get('ticket_date')?.value;
    const userID = this.localStorage.getItem('opId');
    this.resultTotal = this.resultTotal.filter(
      (x: any) => x.qsid !== item.qsid,
    );
    this.resultTotal.push({
      ...item,
      score: this.score,
      userid: userID,
      tell: tell,
      pey_qrcode: pey_qrcode,
      pey_name: pey_name,
      ticket_date: ticket_date,
      ticket_number: ticket_number,
      ratescore: Number(this.score) * Number(item.rate),
    });
  }
  changeResult(result: any, item: any) {
    this.handle++;
    this.score = result?.target?.value;
    const tell = this.formInput.get('tell')?.value;
    const pey_qrcode = this.formInput.get('pey_qrcode')?.value;
    const pey_name = this.formInput.get('pey_name')?.value;
    const ticket_number = this.formInput.get('ticket_number')?.value;
    const ticket_date = this.formInput.get('ticket_date')?.value;
    const userID = this.localStorage.getItem('opId');
    this.resultTotal = this.resultTotal.filter(
      (x: any) => x.qsid !== item.qsid,
    );
    this.resultTotal.push({
      ...item,
      score: this.score,
      userid: userID,
      tell: tell,
      pey_qrcode: pey_qrcode,
      pey_name: pey_name,
      ticket_number: ticket_number,
      ticket_date: ticket_date,
      ratescore: 0,
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
    this.serviceService
      .submitFail(this.resultTotal, type, this.userloginedLevel)
      .subscribe((res) => {
        alert('با موفقیت ثبت شد');
        window.location.reload();
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
