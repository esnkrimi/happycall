import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  userBase = 'https://burjcrown.com/drm/hc/index.php?id=';
  constructor(private http: HttpClient) {}
  submitFail(formInput: any) {
    const body = new FormData();
    body.append('formInput', JSON.stringify(formInput));
    return this.http.post(`${this.userBase}2`, body);
  }

  delete(item: any) {
    return this.http.get(
      `${this.userBase}5&datetime=${item.datetime}&userid=${item.userid}&tell=${item.tell}`,
    );
  }

  edit(formInput: any, id: any) {
    return this.http.get(
      `${this.userBase}4&formInput=${JSON.stringify(formInput)}&fid=${id}`,
    );
  }

  fetchMyQ() {
    return this.http.get(`${this.userBase}6`);
  }

  fetchMyFailures(userid: any) {
    return this.http.get(`${this.userBase}3&userid=${userid}`);
  }
}
