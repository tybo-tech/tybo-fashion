import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UxModel } from 'src/models/ux.model';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-admin-confirm-modal',
  templateUrl: './admin-confirm-modal.component.html',
})
export class AdminConfirmModalComponent implements OnDestroy {
  ux?: UxModel;
  defaultConfirm = 'Are you sure you want to continue?';
  private sub: Subscription;

  constructor(public uxService: UxService) {
    this.sub = uxService.$ux.subscribe((data) => (this.ux = data));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
