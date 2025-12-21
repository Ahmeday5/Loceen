import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-vehicles-and-equipment',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './vehicles-and-equipment.component.html',
  styleUrl: './vehicles-and-equipment.component.scss',
})
export class VehiclesAndEquipmentComponent {
  constructor(private router: Router) {}
}
