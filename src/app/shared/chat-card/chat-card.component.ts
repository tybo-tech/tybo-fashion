import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChatCardData {
  avatar: string;
  name: string;
  message: string;
  time: string;
  online: boolean;
}

@Component({
  selector: 'app-chat-card',
  templateUrl: './chat-card.component.html',
  styleUrls: ['./chat-card.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ChatCardComponent {
  @Input() avatar = 'https://randomuser.me/api/portraits/women/44.jpg';
  @Input() name = 'Jenny Murtaugh';
  @Input() message = 'Hello how are you';
  @Input() time = '19:06';
  @Input() online = true;
}
