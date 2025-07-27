import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UX_MODALS } from 'src/models/ux.model';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-mobile-back',
  templateUrl: './mobile-back.component.html',
  styleUrls: ['./mobile-back.component.scss'],
})
export class MobileBackComponent {
showFavourite() {
this.uxService.show_modal(UX_MODALS.favorites);
}
  @Input() text = '';
  @Input() customLink = '';
  @Input() showShare = false;
  @Output() onShare = new EventEmitter();
  constructor(private router: Router, private uxService: UxService) {}
  back() {
    if (this.customLink) {
      this.router.navigate([this.customLink]);
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
  }
}
