import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeroHeaderData } from 'src/models/HeroHeaderData';

@Component({
  selector: 'app-hero-header',
  templateUrl: './hero-header.component.html',
  styleUrls: ['./hero-header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class HeroHeaderComponent {
  @Input() data!: HeroHeaderData;
  @Output() showBookConsultation = new EventEmitter();
}
