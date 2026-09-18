import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import {
  HappyCallService,
  HappyCallResponse,
  HappyCallUser,
  HappyCallQuestion,
} from './service.service';

import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class MydatChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('usersCanvas')
  usersCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('questionsCanvas')
  questionsCanvas!: ElementRef<HTMLCanvasElement>;

  selectedLayer = '0';

  loading = false;

  errorMessage = '';

  data: HappyCallResponse | null = null;

  private destroy$ = new Subject<void>();

  constructor(private happyCallService: HappyCallService) {}

  ngAfterViewInit(): void {
    this.loadData();
  }

  /*
   * تغییر سطح
   */

  onLayerChange(): void {
    this.loadData();
  }

  /*
   * دریافت اطلاعات از PHP
   */

  loadData(): void {
    this.loading = true;

    this.errorMessage = '';

    this.happyCallService
      .getChartData(this.selectedLayer)

      .pipe(takeUntil(this.destroy$))

      .subscribe({
        next: (response) => {
          this.loading = false;

          if (!response.success) {
            this.errorMessage = 'دریافت اطلاعات با خطا مواجه شد';

            return;
          }

          this.data = response;

          /*
           * اجازه می دهیم Angular View را به روز کند
           * سپس Canvas را رسم می کنیم.
           */

          setTimeout(() => {
            this.drawUsersChart();

            this.drawQuestionsChart();
          });
        },

        error: (error) => {
          this.loading = false;

          console.error(error);

          this.errorMessage = 'خطا در ارتباط با سرور';
        },
      });
  }

  /*
   * ============================================================
   * نمودار کاربران
   * ============================================================
   */

  drawUsersChart(): void {
    if (!this.data) {
      return;
    }

    const canvas = this.usersCanvas.nativeElement;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const users = this.data.users;

    const width = canvas.clientWidth || 900;

    const height = 420;

    /*
     * رزولوشن واقعی Canvas
     */

    canvas.width = width * devicePixelRatio;

    canvas.height = height * devicePixelRatio;

    ctx.scale(devicePixelRatio, devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    /*
     * اگر داده نداریم
     */

    if (users.length === 0) {
      this.drawCenteredText(
        ctx,
        'اطلاعاتی برای این سطح وجود ندارد',
        width,
        height,
      );

      return;
    }

    const margin = {
      top: 40,

      right: 40,

      bottom: 90,

      left: 70,
    };

    const chartWidth = width - margin.left - margin.right;

    const chartHeight = height - margin.top - margin.bottom;

    const maxValue = Math.max(...users.map((x) => x.answer_count));

    /*
     * عنوان
     */

    this.drawText(
      ctx,
      'تعداد پاسخ‌های ثبت‌شده توسط هر کاربر',
      width / 2,
      22,
      17,
      true,
      'center',
    );

    /*
     * خطوط راهنما
     */

    this.drawGrid(
      ctx,
      margin.left,
      margin.top,
      chartWidth,
      chartHeight,
      maxValue,
    );

    const barGap = 25;

    const barWidth = Math.min(
      80,
      (chartWidth - barGap * (users.length + 1)) / users.length,
    );

    users.forEach((user, index) => {
      const x = margin.left + barGap + index * (barWidth + barGap);

      const barHeight =
        maxValue > 0 ? (user.answer_count / maxValue) * chartHeight : 0;

      const y = margin.top + chartHeight - barHeight;

      /*
       * میله
       */

      ctx.fillStyle = '#1976d2';

      ctx.fillRect(x, y, barWidth, barHeight);

      /*
       * عدد بالای میله
       */

      this.drawText(
        ctx,
        this.toPersianNumber(user.answer_count),
        x + barWidth / 2,
        y - 8,
        13,
        true,
        'center',
      );

      /*
       * نام کاربر
       */

      this.drawText(
        ctx,
        user.username,
        x + barWidth / 2,
        margin.top + chartHeight + 25,
        12,
        false,
        'center',
      );

      /*
       * تعداد تماس
       */

      this.drawText(
        ctx,
        `تماس: ${this.toPersianNumber(user.call_count)}`,
        x + barWidth / 2,
        margin.top + chartHeight + 48,
        11,
        false,
        'center',
      );
    });
  }

  /*
   * ============================================================
   * نمودار پاسخ سوالات
   * ============================================================
   */

  drawQuestionsChart(): void {
    if (!this.data) {
      return;
    }

    const canvas = this.questionsCanvas.nativeElement;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const questions = this.data.questions;

    const width = canvas.clientWidth || 1200;

    /*
     * برای تعداد زیاد سؤال
     * Canvas بلند می شود.
     */

    const questionHeight = 260;

    const height = Math.max(500, questions.length * questionHeight);

    canvas.width = width * devicePixelRatio;

    canvas.height = height * devicePixelRatio;

    ctx.scale(devicePixelRatio, devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    if (questions.length === 0) {
      this.drawCenteredText(
        ctx,
        'اطلاعاتی برای این سطح وجود ندارد',
        width,
        300,
      );

      return;
    }

    /*
     * هر سؤال یک گروه از میله هاست
     */

    questions.forEach((question, questionIndex) => {
      this.drawQuestionGroup(ctx, question, questionIndex, width);
    });
  }

  /*
   * رسم یک سؤال
   */

  private drawQuestionGroup(
    ctx: CanvasRenderingContext2D,
    question: HappyCallQuestion,
    questionIndex: number,
    width: number,
  ): void {
    const groupTop = questionIndex * 260;

    const marginLeft = 70;

    const marginRight = 30;

    const chartTop = groupTop + 70;

    const chartHeight = 140;

    const chartWidth = width - marginLeft - marginRight;

    /*
     * عنوان سؤال
     */

    const title = `سؤال ${question.qid}: ${question.title}`;

    this.drawText(
      ctx,
      this.truncateText(title, 120),
      width - 30,
      groupTop + 25,
      15,
      true,
      'right',
    );

    /*
     * گروه سؤال
     */

    if (question.group) {
      this.drawText(
        ctx,
        question.group,
        width - 30,
        groupTop + 48,
        11,
        false,
        'right',
      );
    }

    /*
     * جواب ها
     */

    const answers = question.answers;

    if (answers.length === 0) {
      return;
    }

    const maxCount = Math.max(...answers.map((x) => x.count));

    /*
     * خطوط راهنما
     */

    this.drawGrid(ctx, marginLeft, chartTop, chartWidth, chartHeight, maxCount);

    const gap = 20;

    const barWidth = Math.min(
      65,
      (chartWidth - gap * (answers.length + 1)) / answers.length,
    );

    answers.forEach((answer, index) => {
      const x = marginLeft + gap + index * (barWidth + gap);

      const barHeight =
        maxCount > 0 ? (answer.count / maxCount) * chartHeight : 0;

      const y = chartTop + chartHeight - barHeight;

      /*
       * میله
       */

      ctx.fillStyle = this.getBarColor(index);

      ctx.fillRect(x, y, barWidth, barHeight);

      /*
       * تعداد
       */

      this.drawText(
        ctx,
        this.toPersianNumber(answer.count),
        x + barWidth / 2,
        y - 7,
        12,
        true,
        'center',
      );

      /*
       * متن پاسخ
       */

      this.drawText(
        ctx,
        this.truncateText(answer.answer, 18),
        x + barWidth / 2,
        chartTop + chartHeight + 25,
        11,
        false,
        'center',
      );
    });

    /*
     * خط جداکننده سؤال
     */

    ctx.beginPath();

    ctx.moveTo(20, groupTop + 250);

    ctx.lineTo(width - 20, groupTop + 250);

    ctx.strokeStyle = '#dddddd';

    ctx.stroke();
  }

  /*
   * ============================================================
   * Grid
   * ============================================================
   */

  private drawGrid(
    ctx: CanvasRenderingContext2D,
    left: number,
    top: number,
    width: number,
    height: number,
    maxValue: number,
  ): void {
    const steps = 5;

    ctx.font = '11px Tahoma';

    for (let i = 0; i <= steps; i++) {
      const value = Math.round((maxValue * i) / steps);

      const y = top + height - (height * i) / steps;

      ctx.beginPath();

      ctx.moveTo(left, y);

      ctx.lineTo(left + width, y);

      ctx.strokeStyle = '#e5e5e5';

      ctx.stroke();

      this.drawText(
        ctx,
        this.toPersianNumber(value),
        left - 10,
        y + 4,
        10,
        false,
        'right',
      );
    }
  }

  /*
   * ============================================================
   * رنگ میله ها
   * ============================================================
   */

  private getBarColor(index: number): string {
    const colors = [
      '#1976d2',

      '#388e3c',

      '#f57c00',

      '#7b1fa2',

      '#c62828',

      '#00838f',

      '#5d4037',

      '#455a64',
    ];

    return colors[index % colors.length];
  }

  /*
   * ============================================================
   * Text
   * ============================================================
   */

  private drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontSize = 13,
    bold = false,
    align: CanvasTextAlign = 'right',
  ): void {
    ctx.font = `${bold ? 'bold ' : ''}${fontSize}px Tahoma`;

    ctx.fillStyle = '#333333';

    ctx.textAlign = align;

    ctx.textBaseline = 'middle';

    ctx.fillText(text, x, y);
  }

  private drawCenteredText(
    ctx: CanvasRenderingContext2D,
    text: string,
    width: number,
    height: number,
  ): void {
    this.drawText(ctx, text, width / 2, height / 2, 16, false, 'center');
  }

  /*
   * ============================================================
   * فارسی کردن اعداد
   * ============================================================
   */

  private toPersianNumber(value: number): string {
    return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
  }

  /*
   * کوتاه کردن متن
   */

  private truncateText(text: string, maxLength: number): string {
    text = (text || '').replace(/\s+/g, ' ').trim();

    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength) + '...';
  }

  /*
   * تغییر اندازه صفحه
   */

  onResize(): void {
    if (!this.data) {
      return;
    }

    this.drawUsersChart();

    this.drawQuestionsChart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();

    this.destroy$.complete();
  }
}
