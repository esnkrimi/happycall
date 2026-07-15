import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicService {
  userBase = 'https://burjcrown.com/drm/hc/index.php?id=';
  loadingProgress = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient) {}
}
