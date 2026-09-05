import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatCardComponent } from 'src/app/shared/chat-card/chat-card.component';

@Component({
  selector: 'app-playground-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, ChatCardComponent],
})
export class PlaygroundDashboardComponent {}
