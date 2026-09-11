import { Pipe, PipeTransform } from '@angular/core';
import moment from 'jalali-moment';

@Pipe({
  name: 'jalaliDate',
})
export class JalaliDatePipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    format = 'jYYYY/jMM/jDD HH:mm:ss',
  ): string {
    if (!value) {
      return '';
    }

    return moment(value).locale('fa').format(format);
  }
}
