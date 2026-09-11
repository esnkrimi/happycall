import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '../localstorage';
import { Router } from '@angular/router';
import { PublicValsService } from '../public-vals.service';
import { DontrefrenceService } from './service.service';
import { map, tap } from 'rxjs';
import { PublicService } from '../service.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import * as moment from 'jalali-moment';

@Component({
  selector: 'app-dontrefrence',
  templateUrl: './dontrefrence.component.html',
  styleUrl: './dontrefrence.component.scss',
})
export class DontrefrenceComponent implements OnInit {
  groupedData: any = [];
  constructor(
    private localStorage: LocalStorageService,
    private router: Router,
    private publicValsService: PublicValsService,
    private serviceService: DontrefrenceService,
    private publicService: PublicService,
  ) {}

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
  userFailure: any = [];
  user: any;
  fetchUser() {
    this.user = {
      name: this.localStorage.getItem('opname'),
      family: this.localStorage.getItem('opfamily'),
    };
  }
  ngOnInit(): void {
    this.fetchUser();
    this.fetchMyFailures();
  }

  fetchMyFailures() {
    this.publicService.loadingProgress.next(false);
    this.serviceService
      .fetchMyDontRefrence(this.localStorage.getItem('opId'))
      .subscribe((res) => {
        this.userFailure = res;
        console.log(res);
      });
  }
}
