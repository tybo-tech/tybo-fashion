import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UxModel } from 'src/models/ux.model';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-admin-toast',
  templateUrl: './admin-toast.component.html',
})
export class AdminToastComponent implements OnDestroy {
  ux?: UxModel;
  private sub: Subscription;

  constructor(public uxService: UxService) {
    this.sub = uxService.$ux.subscribe((data) => (this.ux = data));
  }

  clearToast() {
    this.uxService.clear_toast();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
