import { Component } from '@angular/core';
import { ChatCardData } from 'src/app/shared/chat-card/chat-card.component';

type Tab = 'chats' | 'friends';
type NavItem = 'discover' | 'location' | 'add' | 'chats' | 'apps';

@Component({
  selector: 'app-chat-ui',
  templateUrl: './chat-ui.component.html',
  styleUrls: ['./chat-ui.component.scss'],
})
export class ChatUiComponent {
  activeTab: Tab = 'chats';
  activeNav: NavItem = 'chats';

  chats: ChatCardData[] = [
    {
      name: 'Jenny Murtaugh',
      message: 'Hello how are you',
      time: '19:06',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      online: true,
    },
    {
      name: 'Rickie Baroch',
      message: 'I wish you a very good rest',
      time: '14:08',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      online: false,
    },
    {
      name: 'Santiago Valentin',
      message: 'Pleasant rest',
      time: '12:06',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      online: true,
    },
    {
      name: 'Ezequiel Dengra',
      message: 'See you soon',
      time: '11:08',
      avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
      online: false,
    },
    {
      name: 'Neeshaan El Pasha',
      message: 'Does not matter',
      time: '10:00',
      avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
      online: false,
    },
    {
      name: 'Sukhbirpal Dhalan',
      message: 'Best destination',
      time: '09:06',
      avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
      online: false,
    },
  ];

  setTab(tab: Tab): void {
    this.activeTab = tab;
  }

  setNav(item: NavItem): void {
    this.activeNav = item;
  }
}
