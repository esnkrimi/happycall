import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
userBase='https://burjcrown.com/drm/hc/index.php?id='
  constructor(private http:HttpClient) { }
  submitFail(formInput:any){
console.log(`${this.userBase}2&formInput=${JSON.stringify(formInput)}`)    
    return this.http.get(`${this.userBase}2&formInput=${JSON.stringify(formInput)}`)
  }
}
