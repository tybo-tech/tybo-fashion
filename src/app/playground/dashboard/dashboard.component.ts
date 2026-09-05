import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatCardComponent } from 'src/app/shared/chat-card/chat-card.component';
import { JobListCardComponent } from 'src/app/shared/job-list-card/job-list-card.component';
import { CustomerListCardComponent } from 'src/app/shared/customer-list-card/customer-list-card.component';
import { SearchInputComponent } from 'src/app/shared/search-input/search-input.component';

@Component({
  selector: 'app-playground-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, ChatCardComponent, JobListCardComponent, CustomerListCardComponent, SearchInputComponent],
})
export class PlaygroundDashboardComponent {}
