import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicValsService {
  searchWord = new BehaviorSubject('');
  loadinProgress = new BehaviorSubject(false);
  cityCompany = new BehaviorSubject({
    city: '',
    company: '',
  });
  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http
      .get('assets/data.csv', { responseType: 'text' })
      .pipe(map((csv: any) => this.parseTsv(csv)));
  }

 
  private parseTsv(text: string): any[] {
    const lines = text.trim().split('\n');

    const headers = lines[0]
      .split('\t')
      .map(h => h.trim());

    return lines.slice(1).map(line => {
      const values = line.split('\t');

      return headers.reduce((obj, header, index) => {
        obj[header] = values[index]?.trim();
        return obj;
      }, {} as Record<string, string>);
    });
  }
}
