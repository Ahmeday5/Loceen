import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('salesChart') salesChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('expensesChart') expensesChart!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    this.createSalesChart();
    this.createExpensesChart();
  }

  private createSalesChart() {
    {
    new Chart(this.salesChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        datasets: [
          {
            label: 'المبيعات',
            data: [65, 82, 71, 108, 95, 112, 129, 118, 98, 135, 122, 148],
            backgroundColor: '#f4982c',
            borderRadius: 8,
            borderSkipped: false,
          },
          {
            label: 'الأرباح',
            type: 'line',
            data: [18, 25, 22, 38, 32, 42, 51, 46, 35, 58, 52, 68],
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39,174,96,0.2)',
            borderWidth: 4,
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointBackgroundColor: '#27ae60'
          }
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: { legend: { position: 'top', rtl: true } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => v + ' ألف' } },
          x: { ticks: { font: { family: 'Cairo' } } }
        }
      }
    });
  }
}

  private createExpensesChart() {
    new Chart(this.expensesChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['مرتبات', 'إيجار', 'كهرباء', 'تسويق', 'صيانة', 'أخرى'],
        datasets: [{
          data: [42, 18, 15, 12, 28, 9],
          backgroundColor: ['#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#95a5a6'],
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        animation: { animateRotate: true, duration: 2500 },
        plugins: {
          legend: { position: 'top', rtl: true },
          tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + ' ألف ج.م' } }
        }
      }
    });
  }
}

