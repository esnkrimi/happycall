import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '../localstorage';
import { Router } from '@angular/router';
import { PublicValsService } from '../public-vals.service';
import { ServiceService } from './service.service';
import { map, tap } from 'rxjs';
import { PublicService } from '../service.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import * as moment from 'jalali-moment';
import { HttpClient } from '@angular/common/http';
import {
  Chart,
  ChartConfiguration,
  ChartOptions,
  registerables,
} from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class MydatChartComponent implements OnInit {
  selectedLevel = 1;

  loading = false;

  users: UserAnalysis[] = [];

  questions: QuestionAnalysis[] = [];

  totalAnswers = 0;

  overallSatisfaction = 0;

  /*
   * نمودار کاربران
   */
  usersChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'رضایت',
        data: [],
        borderWidth: 1,
      },
      {
        label: 'عدم رضایت',
        data: [],
        borderWidth: 1,
      },
    ],
  };

  usersChartOptions: ChartOptions<'bar'> = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: 'top',
      },
    },

    scales: {
      x: {
        ticks: {
          font: {
            family: 'Tahoma',
          },
        },
      },

      y: {
        beginAtZero: true,

        max: 100,

        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  /*
   * نمودار سؤالات
   */
  questionsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'رضایت',
        data: [],
        borderWidth: 1,
      },
      {
        label: 'عدم رضایت',
        data: [],
        borderWidth: 1,
      },
    ],
  };

  questionsChartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',

    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: 'top',
      },
    },

    scales: {
      x: {
        beginAtZero: true,

        max: 100,

        ticks: {
          callback: (value) => `${value}%`,
        },
      },

      y: {
        ticks: {
          font: {
            family: 'Tahoma',
            size: 12,
          },
        },
      },
    },
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  levelChanged(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    const url = `https://burjcrown.com/drm/hchome/index.php?id=11&level=${this.selectedLevel}&`;

    this.http.get<DashboardResponse>(url).subscribe({
      next: (result) => {
        this.users = result.users || [];

        this.questions = result.questions || [];

        this.totalAnswers = result.totalAnswers || 0;

        this.overallSatisfaction = result.overallSatisfaction || 0;

        this.createUsersChart();

        this.createQuestionsChart();

        this.loading = false;
      },

      error: (error) => {
        console.error('Happy Call Dashboard Error:', error);

        this.users = [];

        this.questions = [];

        this.totalAnswers = 0;

        this.overallSatisfaction = 0;

        this.loading = false;
      },
    });
  }

  /*
   * نمودار کاربران
   *
   * برای هر کاربر:
   * درصد رضایت
   * درصد عدم رضایت
   */
  createUsersChart(): void {
    this.usersChartData = {
      labels: this.users.map((user) => user.username),

      datasets: [
        {
          label: 'رضایت',

          data: this.users.map((user) => user.satisfactionPercent),

          borderWidth: 1,
        },

        {
          label: 'عدم رضایت',

          data: this.users.map((user) => 100 - user.satisfactionPercent),

          borderWidth: 1,
        },
      ],
    };
  }

  /*
   * نمودار سؤالات
   */
  createQuestionsChart(): void {
    this.questionsChartData = {
      labels: this.questions.map((question) =>
        this.shortQuestion(question.title),
      ),

      datasets: [
        {
          label: 'رضایت',

          data: this.questions.map((question) => question.satisfactionPercent),

          borderWidth: 1,
        },

        {
          label: 'عدم رضایت',

          data: this.questions.map(
            (question) => 100 - question.satisfactionPercent,
          ),

          borderWidth: 1,
        },
      ],
    };
  }

  /*
   * کوتاه کردن عنوان سؤال برای Chart
   */
  shortQuestion(title: string): string {
    if (!title) {
      return '';
    }

    const maxLength = 70;

    if (title.length <= maxLength) {
      return title;
    }

    return title.substring(0, maxLength) + '...';
  }
}

interface UserAnalysis {
  userid: number;
  username: string;
  total: number;
  satisfied: number;
  unsatisfied: number;
  satisfactionPercent: number;
}

interface QuestionAnalysis {
  qid: number;
  title: string;
  model: string;
  total: number;
  satisfied: number;
  unsatisfied: number;
  satisfactionPercent: number;
}

interface DashboardResponse {
  level: number;

  users: UserAnalysis[];

  questions: QuestionAnalysis[];

  totalAnswers: number;

  overallSatisfaction: number;
}
