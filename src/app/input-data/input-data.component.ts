import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-input-data',
  templateUrl: './input-data.component.html',
  styleUrl: './input-data.component.scss',
})
export class InputDataComponent implements OnInit {
  loadingProgress=false
  unsatisfying=false
  ngOnInit(): void {

  }
  formInput = new FormGroup({
    tell: new FormControl(''),
    opname: new FormControl(''),
    opfamily: new FormControl(''),
    opType: new FormControl(''),
    typehc: new FormControl(''),
    datetime: new FormControl(''),
    result: new FormControl(''),
    resultunsatisfying: new FormControl(''),
    repairDateTime: new FormControl(''),
  });
  changeResult(result:any){
    this.unsatisfying=true
  }
}
