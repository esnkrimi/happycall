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

  fetchMyFailures(userid: any) {
    console.log(`${this.userBase}3&userid=${userid}`);
    return this.http.get(`${this.userBase}3&userid=${userid}`);
  }
}
