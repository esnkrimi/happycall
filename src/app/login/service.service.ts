import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  userBase = 'https://burjcrown.com/drm/hc/index.php?id=';
  constructor(private http: HttpClient) {}
  login(user: any, pass: any) {
    console.log(`${this.userBase}1&username=${user}&password=${pass}`);
    return this.http.get(`${this.userBase}1&username=${user}&password=${pass}`);
  }
}
