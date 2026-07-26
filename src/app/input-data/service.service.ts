import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  userBase = 'https://burjcrown.com/drm/hc/index.php?id=';
  constructor(private http: HttpClient) {}
  submitFail(formInput: any) {
    return this.http.get(
      `${this.userBase}2&formInput=${JSON.stringify(formInput)}`,
    );
  }

  delete(id: any) {
    console.log(`${this.userBase}5&fid=${id}`);
    return this.http.get(`${this.userBase}5&fid=${id}`);
  }

  edit(formInput: any, id: any) {
    return this.http.get(
      `${this.userBase}4&formInput=${JSON.stringify(formInput)}&fid=${id}`,
    );
  }

  fetchMyFailures(userid: any) {
    console.log(`${this.userBase}3&userid=${userid}`);
    return this.http.get(`${this.userBase}3&userid=${userid}`);
  }
}
