import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'persian',
  standalone: true,
})
export class PersianPipe implements PipeTransform {
  transform(value: number): string {
    const result = Math.round(value / 10);
    if ((value === 0)||(!value)) return '0' ;
    else return result.toLocaleString('fa-IR');
  }
}
