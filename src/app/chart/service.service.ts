import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HappyCallUser {
  userid: number;
  username: string;
  answer_count: number;
  call_count: number;
}

export interface HappyCallAnswer {
  answer: string;
  count: number;
}

export interface HappyCallQuestion {
  qid: number;
  title: string;
  group: string;
  level: string;
  type: string;
  model: string;
  ceilspecial: number;
  answers: HappyCallAnswer[];
}

export interface HappyCallResponse {
  success: boolean;

  layer: string;

  summary: {
    users: number;
    answers: number;
    calls: number;
    questions: number;
  };

  users: HappyCallUser[];

  questions: HappyCallQuestion[];
}

@Injectable({
  providedIn: 'root',
})
export class HappyCallService {
  /*
   * آدرس PHP خودتان را اینجا قرار دهید
   */
  private apiUrl = 'https://burjcrown.com/drm/hchome/index.php?id=11';

  constructor(private http: HttpClient) {}

  getChartData(layer: string): Observable<HappyCallResponse> {
    const params = new HttpParams().set('layer', 1);

    return this.http.get<HappyCallResponse>(this.apiUrl, { params });
  }
}
