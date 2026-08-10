import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  userBase = 'https://burjcrown.com/drm/hc/index.php?id=';
  constructor(private http: HttpClient) {}
  submitFail(formInput: any, type: any) {
    const body = new FormData();
    body.append('formInput', JSON.stringify(formInput));
    return this.http.post(`${this.userBase}2&type=${type}`, body);
  }

  delete(item: any) {
    return this.http.get(
      `${this.userBase}5&datetime=${item.datetime}&userid=${item.userid}&tell=${item.tell}`,
    );
  }

  updateDontRefre(
    tell: any,
    pey_name: any,
    pey_qrcode: any,
    userID: any,
    ticket_number: any,
    ticket_date: any,
  ) {
    return this.http.get(
      `${this.userBase}7&userid=${userID}&pey_name=${pey_name}&pey_qrcode=${pey_qrcode}&ticket_date=${ticket_date}&ticket_number=${ticket_number}&tell=${tell}`,
    );
  }

  edit(formInput: any, id: any) {
    return this.http.get(
      `${this.userBase}4&formInput=${JSON.stringify(formInput)}&fid=${id}`,
    );
  }

  fetchMyQ(type: any) {
    const level = localStorage.getItem('level');
    return this.http.get(`${this.userBase}6&type=${type}&level=${level}`);
  }

  fetchMyFailures(userid: any) {
    return this.http.get(`${this.userBase}3&userid=${userid}`);
  }
}
