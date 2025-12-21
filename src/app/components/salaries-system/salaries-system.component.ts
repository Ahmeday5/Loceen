import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-salaries-system',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './salaries-system.component.html',
  styleUrl: './salaries-system.component.scss',
})

export class SalariesSystemComponent {
  constructor(private router: Router) {}
}
