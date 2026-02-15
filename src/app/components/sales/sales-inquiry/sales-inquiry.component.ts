import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { PaginationComponent } from '../../../layout/pagination/pagination.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { allSold } from '../../../types/solds.type';
import { TraderForSelection } from '../../../types/expense.type';

@Component({
  selector: 'app-sales-inquiry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './sales-inquiry.component.html',
  styleUrl: './sales-inquiry.component.scss',
})
export class SalesInquiryComponent  {

}
