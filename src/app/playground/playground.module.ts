import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ChatUiComponent } from './chat-ui/chat-ui.component';
import { ChatCardComponent } from '../shared/chat-card/chat-card.component';

const routes: Routes = [
  {
    path: '',
    component: ChatUiComponent,
  },
  {
    path: 'chat-ui',
    component: ChatUiComponent,
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.PlaygroundDashboardComponent
      ),
  },
];

@NgModule({
  declarations: [ChatUiComponent],
  imports: [CommonModule, ChatCardComponent, RouterModule.forChild(routes)],
})
export class PlaygroundModule {}
